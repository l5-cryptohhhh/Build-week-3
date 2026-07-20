import { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { isValidUsername } from '../../utils/validators'

export default function ProfileEditForm({ show, user, onClose, onSave, isSaving }) {
  const [form, setForm] = useState({
    fullName: user.fullName,
    username: user.username,
    bio: user.bio || '',
    avatarUrl: user.avatarUrl || '',
  })
  const [error, setError] = useState(null)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.fullName.trim()) {
      setError('Il nome completo e obbligatorio.')
      return
    }
    if (!isValidUsername(form.username)) {
      setError('Lo username deve avere 3-20 caratteri (lettere, numeri, "_" o ".").')
      return
    }
    setError(null)
    onSave(form)
  }

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Modifica profilo</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <p className="text-danger">{error}</p>}
          <Form.Group className="mb-3" controlId="editFullName">
            <Form.Label>Nome completo</Form.Label>
            <Form.Control name="fullName" value={form.fullName} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3" controlId="editUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control name="username" value={form.username} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3" controlId="editBio">
            <Form.Label>Bio</Form.Label>
            <Form.Control as="textarea" rows={3} name="bio" value={form.bio} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-1" controlId="editAvatarUrl">
            <Form.Label>URL immagine profilo (opzionale)</Form.Label>
            <Form.Control
              name="avatarUrl"
              value={form.avatarUrl}
              onChange={handleChange}
              placeholder="https://..."
            />
            <Form.Text className="text-secondary">
              L&apos;upload reale delle immagini non e supportato in questa versione: incolla un
              link diretto a un&apos;immagine.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose} type="button">
            Annulla
          </Button>
          <Button variant="primary" type="submit" disabled={isSaving}>
            {isSaving ? 'Salvataggio...' : 'Salva modifiche'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
