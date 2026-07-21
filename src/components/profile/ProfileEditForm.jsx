import { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { isValidUsername } from '../../utils/validators'
import Avatar from '../common/Avatar'

const MAX_AVATAR_BYTES = 2 * 1024 * 1024

export default function ProfileEditForm({ show, user, onClose, onSave, isSaving }) {
  const [form, setForm] = useState({
    fullName: user.fullName,
    username: user.username,
    jobTitle: user.jobTitle || '',
    bio: user.bio || '',
    avatarUrl: user.avatarUrl || '',
  })
  const [error, setError] = useState(null)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarFileChange = (event) => {
    const file = event.target.files[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Seleziona un file immagine valido.')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError("L'immagine supera la dimensione massima di 2MB.")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setError(null)
      setForm((prev) => ({ ...prev, avatarUrl: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatar = () => {
    setForm((prev) => ({ ...prev, avatarUrl: '' }))
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
          <Form.Group className="mb-3" controlId="editJobTitle">
            <Form.Label>Titolo professionale</Form.Label>
            <Form.Control
              name="jobTitle"
              value={form.jobTitle}
              onChange={handleChange}
              placeholder="es. Front-End Developer presso EPICODE"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="editBio">
            <Form.Label>Bio</Form.Label>
            <Form.Control as="textarea" rows={3} name="bio" value={form.bio} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-1" controlId="editAvatarFile">
            <Form.Label>Immagine profilo (opzionale)</Form.Label>
            <div className="d-flex align-items-center gap-3 mb-2">
              <Avatar user={{ ...form }} size={56} />
              <div className="d-flex flex-column gap-1">
                <Form.Control type="file" accept="image/*" onChange={handleAvatarFileChange} />
                {form.avatarUrl && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-danger text-decoration-none align-self-start"
                    type="button"
                    onClick={handleRemoveAvatar}
                  >
                    Rimuovi immagine
                  </Button>
                )}
              </div>
            </div>
            <Form.Text className="text-secondary">
              Scegli un file dal tuo dispositivo (max 2MB). Verra salvato insieme al profilo.
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
