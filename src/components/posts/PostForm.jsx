import { useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { getLinkType } from '../../utils/linkPreview'
import { uploadPostMedia } from '../../api/storageService'
import { selectCurrentUser } from '../../features/auth/authSlice'

// Le foto vanno come base64 dentro il documento del post (niente Storage,
// evita di dover collegare una carta di credito solo per questo, vedi
// CHECKPOINT.md): limite ridotto per stare dentro il tetto di 1MB per
// documento di Firestore, con margine per testo/altri campi. I video invece
// restano su Firebase Storage (50MB non ci starebbe comunque in un
// documento) - vedi handleSubmit.
const MAX_PHOTO_BYTES = 700 * 1024
const MAX_VIDEO_BYTES = 50 * 1024 * 1024

function isUploadedMedia(url) {
  const type = getLinkType(url)
  return type === 'image' || type === 'video'
}

export default function PostForm({
  initialContent = '',
  initialImageUrl = '',
  submitLabel = 'Pubblica',
  onSubmit,
  onCancel,
  isSubmitting = false,
  showImageField = false,
}) {
  const currentUser = useSelector(selectCurrentUser)
  const [content, setContent] = useState(initialContent)
  const [linkUrl, setLinkUrl] = useState(isUploadedMedia(initialImageUrl) ? '' : initialImageUrl)
  const [uploadedMedia, setUploadedMedia] = useState(() =>
    isUploadedMedia(initialImageUrl)
      ? { url: initialImageUrl, kind: getLinkType(initialImageUrl) }
      : null,
  )
  const [pendingFile, setPendingFile] = useState(null)
  const [fileError, setFileError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const photoInputRef = useRef(null)
  const videoInputRef = useRef(null)

  const textareaRef = useRef(null)

  const handleChange = (event) => {
    setContent(event.target.value)

    const textarea = textareaRef.current
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return
    try {
      let imageUrl = uploadedMedia ? uploadedMedia.url : linkUrl.trim()
      if (pendingFile) {
        setUploading(true)
        imageUrl = await uploadPostMedia(currentUser.id, pendingFile)
        setUploading(false)
      }
      onSubmit({ content: trimmed, imageUrl })
      if (!initialContent) {
        setContent('')
        setLinkUrl('')
        setUploadedMedia(null)
        setPendingFile(null)
        setFileError(null)
      }
    } catch {
      setUploading(false)
      setFileError('Caricamento media non riuscito. Riprova.')
    }
  }

  // Anteprima locale immediata via data URL in entrambi i casi. Per le foto
  // e' anche il valore finale (base64 dentro il documento, nessun upload).
  // Per i video invece serve un upload reale su Storage: si marca il file
  // come "pending" e lo si carica solo al submit (vedi handleSubmit), cosi'
  // scegliere un video e poi annullare il post non consuma banda/quota.
  const readFileAsMedia = (file, maxBytes, sizeLabel, kind) => {
    if (file.size > maxBytes) {
      setFileError(`File troppo grande (max ${sizeLabel}).`)
      return
    }
    setFileError(null)
    if (kind === 'video') setPendingFile(file)
    const reader = new FileReader()
    reader.onload = () => setUploadedMedia({ url: reader.result, kind })
    reader.readAsDataURL(file)
  }

  const handlePhotoChange = (event) => {
    const file = event.target.files[0]
    event.target.value = ''
    if (file) readFileAsMedia(file, MAX_PHOTO_BYTES, '700KB', 'image')
  }

  const handleVideoChange = (event) => {
    const file = event.target.files[0]
    event.target.value = ''
    if (file) readFileAsMedia(file, MAX_VIDEO_BYTES, '50MB', 'video')
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-2" controlId="postContent">
        <Form.Control
          ref={textareaRef}
          as="textarea"
          rows={3}
          placeholder="Condividi un aggiornamento, un traguardo, un'idea..."
          value={content}
          onChange={handleChange}
          style={{
            resize: 'none',
            overflow: 'hidden',
          }}
          required
        />
      </Form.Group>

      {showImageField && (
        <>
          {fileError && <p className="text-danger small mb-2">{fileError}</p>}

          {uploadedMedia && (
            <div className="position-relative mb-2 d-inline-block">
              {uploadedMedia.kind === 'image' ? (
                <img
                  src={uploadedMedia.url}
                  alt=""
                  className="rounded"
                  style={{ maxHeight: 220, maxWidth: '100%' }}
                />
              ) : (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video src={uploadedMedia.url} controls className="rounded" style={{ maxHeight: 220 }} />
              )}
              <Button
                variant="light"
                size="sm"
                type="button"
                className="position-absolute top-0 end-0 m-1 rounded-circle p-1 d-inline-flex align-items-center justify-content-center"
                style={{ width: 28, height: 28 }}
                onClick={() => {
                  setUploadedMedia(null)
                  setPendingFile(null)
                }}
                title="Rimuovi"
              >
                <i className="bi bi-x-lg"></i>
              </Button>
            </div>
          )}

          <Form.Group className="mb-2" controlId="postImageUrl">
            <Form.Control
              type="text"
              placeholder="Oppure incolla un link esterno (foto, video, sito/canale)..."
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              disabled={Boolean(uploadedMedia)}
            />
          </Form.Group>

          <div className="d-flex gap-2 mb-2">
            <input
              type="file"
              accept="image/*"
              ref={photoInputRef}
              onChange={handlePhotoChange}
              className="d-none"
            />
            <input
              type="file"
              accept="video/*"
              ref={videoInputRef}
              onChange={handleVideoChange}
              className="d-none"
            />
            <Button
              variant="primary"
              type="button"
              className="rounded-pill d-inline-flex align-items-center gap-1"
              onClick={() => photoInputRef.current?.click()}
              title="Carica foto"
            >
              <i className="bi bi-camera-fill"></i>Immagine
            </Button>
            <Button
              variant="danger"
              type="button"
              className="rounded-pill d-inline-flex align-items-center gap-1"
              onClick={() => videoInputRef.current?.click()}
              title="Carica video"
            >
              <i className="bi bi-play-fill"></i>Video
            </Button>
          </div>
        </>
      )}

      <div className="d-flex justify-content-end gap-2">
        {onCancel && (
          <Button variant="outline-secondary" type="button" onClick={onCancel}>
            Annulla
          </Button>
        )}
        <Button variant="primary" type="submit" disabled={isSubmitting || uploading || !content.trim()}>
          {uploading ? 'Caricamento media...' : submitLabel}
        </Button>
      </div>
    </Form>
  )
}
