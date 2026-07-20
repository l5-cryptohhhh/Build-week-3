import { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

export default function PostForm({
  initialContent = '',
  submitLabel = 'Pubblica',
  onSubmit,
  onCancel,
  isSubmitting = false,
}) {
  const [content, setContent] = useState(initialContent)

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    if (!initialContent) setContent('')
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-2" controlId="postContent">
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="A cosa stai pensando?"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          required
        />
      </Form.Group>
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
