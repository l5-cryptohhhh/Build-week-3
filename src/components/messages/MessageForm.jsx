import { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

export default function MessageForm({ initialValue = '', submitLabel, onSubmit, onCancel }) {
  const [content, setContent] = useState(initialValue)

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    if (!initialValue) setContent('')
  }

  return (
    <Form onSubmit={handleSubmit} className="d-flex gap-2">
      <Form.Control
        placeholder="Scrivi un messaggio..."
        value={content}
        onChange={(event) => setContent(event.target.value)}
        autoFocus={Boolean(initialValue)}
      />
      {onCancel && (
        <Button variant="outline-secondary" type="button" onClick={onCancel}>
          Annulla
        </Button>
      )}
      <Button type="submit" variant="primary" disabled={!content.trim()}>
        {onCancel ? submitLabel || 'Salva' : <i className="bi bi-send"></i>}
      </Button>
    </Form>
  )
}
