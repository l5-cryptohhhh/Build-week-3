import { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

export default function CommentForm({ initialValue = '', submitLabel, onSubmit, onCancel }) {
  const [content, setContent] = useState(initialValue)

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    if (!initialValue) setContent('')
  }

  return (
    <Form onSubmit={handleSubmit} className="d-flex gap-2 mt-2">
      <Form.Control
        size="sm"
        placeholder="Scrivi un commento..."
        value={content}
        onChange={(event) => setContent(event.target.value)}
        autoFocus={Boolean(initialValue)}
      />
      {onCancel && (
        <Button size="sm" variant="outline-secondary" type="button" onClick={onCancel}>
          Annulla
        </Button>
      )}
      <Button size="sm" variant="primary" type="submit" disabled={!content.trim()}>
        {onCancel ? submitLabel || 'Salva' : 'Invia'}
      </Button>
    </Form>
  )
}
