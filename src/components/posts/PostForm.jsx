import { useRef, useState } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

const MAX_PHOTO_BYTES = 3 * 1024 * 1024
const MAX_VIDEO_BYTES = 50 * 1024 * 1024

function isDataUrl(url) {
  return Boolean(url) && url.startsWith('data:')
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
  const [content, setContent] = useState(initialContent)
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 3070ec9 (button e url foto sistemate)
  const [linkUrl, setLinkUrl] = useState(isDataUrl(initialImageUrl) ? '' : initialImageUrl)
  const [uploadedMedia, setUploadedMedia] = useState(() =>
    isDataUrl(initialImageUrl)
      ? { url: initialImageUrl, kind: initialImageUrl.startsWith('data:video') ? 'video' : 'image' }
      : null,
  )
  const [fileError, setFileError] = useState(null)
  const photoInputRef = useRef(null)
  const videoInputRef = useRef(null)
<<<<<<< HEAD
=======
  const [imageUrl, setImageUrl] = useState(initialImageUrl)
  const [showImageInput, setShowImageInput] = useState(Boolean(initialImageUrl))
>>>>>>> a6dfe14 (aggiornamento interfaccia e funzionalità)
=======
>>>>>>> 3070ec9 (button e url foto sistemate)

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return
<<<<<<< HEAD
<<<<<<< HEAD
    onSubmit({ content: trimmed, imageUrl: uploadedMedia ? uploadedMedia.url : linkUrl.trim() })
    if (!initialContent) {
      setContent('')
      setLinkUrl('')
      setUploadedMedia(null)
      setFileError(null)
    }
  }

  const readFileAsMedia = (file, maxBytes, label, kind) => {
    if (file.size > maxBytes) {
      setFileError(`File troppo grande per ${label} (max ${Math.round(maxBytes / (1024 * 1024))}MB).`)
      return
    }
    setFileError(null)
    const reader = new FileReader()
    reader.onload = () => setUploadedMedia({ url: reader.result, kind })
    reader.readAsDataURL(file)
  }

  const handlePhotoChange = (event) => {
    const file = event.target.files[0]
    event.target.value = ''
    if (file) readFileAsMedia(file, MAX_PHOTO_BYTES, 'le foto', 'image')
  }

  const handleVideoChange = (event) => {
    const file = event.target.files[0]
    event.target.value = ''
    if (file) readFileAsMedia(file, MAX_VIDEO_BYTES, 'i video', 'video')
=======
    onSubmit({ content: trimmed, imageUrl: imageUrl.trim() })
=======
    onSubmit({ content: trimmed, imageUrl: uploadedMedia ? uploadedMedia.url : linkUrl.trim() })
>>>>>>> 3070ec9 (button e url foto sistemate)
    if (!initialContent) {
      setContent('')
      setLinkUrl('')
      setUploadedMedia(null)
      setFileError(null)
    }
>>>>>>> a6dfe14 (aggiornamento interfaccia e funzionalità)
  }

  const readFileAsMedia = (file, maxBytes, label, kind) => {
    if (file.size > maxBytes) {
      setFileError(`File troppo grande per ${label} (max ${Math.round(maxBytes / (1024 * 1024))}MB).`)
      return
    }
    setFileError(null)
    const reader = new FileReader()
    reader.onload = () => setUploadedMedia({ url: reader.result, kind })
    reader.readAsDataURL(file)
  }

  const handlePhotoChange = (event) => {
    const file = event.target.files[0]
    event.target.value = ''
    if (file) readFileAsMedia(file, MAX_PHOTO_BYTES, 'le foto', 'image')
  }

  const handleVideoChange = (event) => {
    const file = event.target.files[0]
    event.target.value = ''
    if (file) readFileAsMedia(file, MAX_VIDEO_BYTES, 'i video', 'video')
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-2" controlId="postContent">
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Condividi un aggiornamento, un traguardo, un'idea..."
          value={content}
          onChange={(event) => setContent(event.target.value)}
          required
        />
      </Form.Group>
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 3070ec9 (button e url foto sistemate)

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
                onClick={() => setUploadedMedia(null)}
                title="Rimuovi"
              >
                <i className="bi bi-x-lg"></i>
              </Button>
            </div>
<<<<<<< HEAD
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
=======
      {showImageInput && (
        <Form.Group className="mb-2" controlId="postImageUrl">
          <Form.Control
            type="text"
            placeholder="URL immagine (https://...)"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
          />
        </Form.Group>
      )}
      <div className="d-flex justify-content-between align-items-center gap-2">
        {showImageField ? (
          <Button
            variant="outline-secondary"
            type="button"
            size="sm"
            onClick={() => setShowImageInput((prev) => !prev)}
          >
            <i className="bi bi-image me-1"></i>Aggiungi immagine
>>>>>>> a6dfe14 (aggiornamento interfaccia e funzionalità)
          </Button>
        ) : (
          <span />
        )}
        <div className="d-flex gap-2">
          {onCancel && (
            <Button variant="outline-secondary" type="button" onClick={onCancel}>
              Annulla
            </Button>
=======
>>>>>>> 3070ec9 (button e url foto sistemate)
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
        <Button variant="primary" type="submit" disabled={isSubmitting || !content.trim()}>
          {submitLabel}
        </Button>
      </div>
    </Form>
  )
}
