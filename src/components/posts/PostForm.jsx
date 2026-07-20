import { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

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
  const [imageUrl, setImageUrl] = useState(initialImageUrl)
  const [showImageInput, setShowImageInput] = useState(Boolean(initialImageUrl))

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return
    onSubmit({ content: trimmed, imageUrl: imageUrl.trim() })
    if (!initialContent) {
      setContent('')
      setImageUrl('')
      setShowImageInput(false)
    }
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
          </Button>
        ) : (
          <span />
        )}
        <div className="d-flex gap-2">
          {onCancel && (
            <Button variant="outline-secondary" type="button" onClick={onCancel}>
              Annulla
            </Button>
          )}
          <Button variant="primary" type="submit" disabled={isSubmitting || !content.trim()}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </Form>
  )
}
