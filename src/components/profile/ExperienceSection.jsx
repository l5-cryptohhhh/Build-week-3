import { useState } from 'react'
import { useDispatch } from 'react-redux'
import Card from 'react-bootstrap/Card'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { updateProfile } from '../../features/users/usersSlice'
import { requestConfirm } from '../../utils/confirm'

function ExperienceForm({ show, onClose, onSave }) {
  const [form, setForm] = useState({ title: '', company: '', period: '', description: '' })
  const [error, setError] = useState(null)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.title.trim()) {
      setError('Il titolo (ruolo) e obbligatorio.')
      return
    }
    setError(null)
    onSave(form)
    setForm({ title: '', company: '', period: '', description: '' })
  }

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Aggiungi esperienza</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <p className="text-danger">{error}</p>}
          <Form.Group className="mb-3" controlId="expTitle">
            <Form.Label>Ruolo / titolo</Form.Label>
            <Form.Control
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="es. Front-End Developer"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="expCompany">
            <Form.Label>Azienda</Form.Label>
            <Form.Control
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="es. EPICODE"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="expPeriod">
            <Form.Label>Periodo</Form.Label>
            <Form.Control
              name="period"
              value={form.period}
              onChange={handleChange}
              placeholder="es. 2024 - presente"
            />
          </Form.Group>
          <Form.Group className="mb-1" controlId="expDescription">
            <Form.Label>Descrizione (opzionale)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose} type="button">
            Annulla
          </Button>
          <Button variant="primary" type="submit">
            Aggiungi
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default function ExperienceSection({ user, isOwnProfile }) {
  const dispatch = useDispatch()
  const [showForm, setShowForm] = useState(false)
  const experiences = user.experiences || []

  if (!isOwnProfile && experiences.length === 0) return null

  const handleAdd = (data) => {
    const experience = { id: Date.now(), ...data }
    dispatch(updateProfile({ id: user.id, changes: { experiences: [...experiences, experience] } }))
    setShowForm(false)
  }

  const handleDelete = async (id) => {
    const confirmed = await requestConfirm({
      title: "Eliminare l'esperienza",
      message: 'Eliminare definitivamente questa esperienza?',
      confirmLabel: 'Elimina',
    })
    if (confirmed) {
      dispatch(
        updateProfile({
          id: user.id,
          changes: { experiences: experiences.filter((exp) => exp.id !== id) },
        }),
      )
    }
  }

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="h5 mb-0">Esperienze</Card.Title>
          {isOwnProfile && (
            <button
              type="button"
              className="btn btn-link p-0 text-primary"
              onClick={() => setShowForm(true)}
              aria-label="Aggiungi esperienza"
              title="Aggiungi esperienza"
            >
              <i className="bi bi-plus-lg fs-5"></i>
            </button>
          )}
        </div>

        {experiences.length === 0 ? (
          <p className="text-secondary small mb-0">Nessuna esperienza aggiunta.</p>
        ) : (
          experiences.map((exp, index) => (
            <div
              key={exp.id}
              className={`d-flex justify-content-between align-items-start ${
                index < experiences.length - 1 ? 'mb-3 pb-3 border-bottom' : ''
              }`}
            >
              <div>
                <h3 className="h6 mb-0">{exp.title}</h3>
                <div className="text-secondary small">
                  {exp.company}
                  {exp.company && exp.period && ' · '}
                  {exp.period}
                </div>
                {exp.description && (
                  <p className="mb-0 mt-1 small" style={{ whiteSpace: 'pre-wrap' }}>
                    {exp.description}
                  </p>
                )}
              </div>
              {isOwnProfile && (
                <button
                  type="button"
                  className="btn btn-sm btn-link text-danger p-0 flex-shrink-0 ms-2"
                  onClick={() => handleDelete(exp.id)}
                  aria-label="Elimina esperienza"
                >
                  <i className="bi bi-trash"></i>
                </button>
              )}
            </div>
          ))
        )}
      </Card.Body>

      {isOwnProfile && (
        <ExperienceForm show={showForm} onClose={() => setShowForm(false)} onSave={handleAdd} />
      )}
    </Card>
  )
}
