import { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

export default function CommentForm({ onSubmit }) {
  const [content, setContent] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setContent('')
  }

  return (
    <Form onSubmit={handleSubmit} className="d-flex gap-2 mt-2">
      <Form.Control
        size="sm"
        placeholder="Scrivi un commento..."
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />
      <Button size="sm" variant="primary" type="submit" disabled={!content.trim()}>
        Invia
      </Button>
    </Form>
  )
}
