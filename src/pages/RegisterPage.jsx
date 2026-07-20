import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import { registerUser, selectAuthStatus, selectAuthError } from '../features/auth/authSlice'
import ErrorAlert from '../components/common/ErrorAlert'
import { isValidEmail, isValidPassword, isValidUsername } from '../utils/validators'

const initialForm = { fullName: '', username: '', email: '', password: '', confirmPassword: '' }

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const status = useSelector(selectAuthStatus)
  const error = useSelector(selectAuthError)
  const [form, setForm] = useState(initialForm)
  const [formError, setFormError] = useState(null)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    if (!form.fullName.trim()) return 'Il nome completo e obbligatorio.'
    if (!isValidUsername(form.username)) {
      return 'Lo username deve avere 3-20 caratteri (lettere, numeri, "_" o ".").'
    }
    if (!isValidEmail(form.email)) return 'Inserisci un indirizzo email valido.'
    if (!isValidPassword(form.password)) return 'La password deve avere almeno 8 caratteri.'
    if (form.password !== form.confirmPassword) return 'Le password non coincidono.'
    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationError = validate()
    if (validationError) {
      setFormError(validationError)
      return
    }
    setFormError(null)
    const { confirmPassword: _confirmPassword, ...payload } = form
    const result = await dispatch(registerUser(payload))
    if (registerUser.fulfilled.match(result)) {
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light px-3 py-4">
      <Card style={{ maxWidth: 460, width: '100%' }} className="shadow-sm">
        <Card.Body className="p-4">
          <h1 className="h3 mb-4 text-center">Crea un account</h1>
          <ErrorAlert message={formError || error} />
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="registerFullName">
              <Form.Label>Nome completo</Form.Label>
              <Form.Control name="fullName" value={form.fullName} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="registerUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control name="username" value={form.username} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="registerEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="registerPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4" controlId="registerConfirmPassword">
              <Form.Label>Conferma password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button
              type="submit"
              variant="primary"
              className="w-100"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Creazione account...' : 'Registrati'}
            </Button>
          </Form>
          <p className="text-center mt-3 mb-0">
            Hai gia un account? <Link to="/login">Accedi</Link>
          </p>
        </Card.Body>
      </Card>
    </div>
  )
}
