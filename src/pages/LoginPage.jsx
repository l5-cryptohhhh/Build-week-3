import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import { loginUser, selectAuthStatus, selectAuthError } from '../features/auth/authSlice'
import ErrorAlert from '../components/common/ErrorAlert'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const status = useSelector(selectAuthStatus)
  const error = useSelector(selectAuthError)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = await dispatch(loginUser(form))
    if (loginUser.fulfilled.match(result)) {
      const redirectTo = location.state?.from?.pathname || '/'
      navigate(redirectTo, { replace: true })
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light px-3">
      <Card style={{ maxWidth: 420, width: '100%' }} className="shadow-sm">
        <Card.Body className="p-4">
          <h1 className="brand-logo text-center mb-1">
            <span className="brand-in">in</span>
            <span className="brand-clone">Clone</span>
          </h1>
          <p className="text-secondary text-center mb-4">
            Accedi per continuare al tuo network professionale
          </p>
          <ErrorAlert message={error} />
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="loginEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </Form.Group>
            <Form.Group className="mb-4" controlId="loginPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </Form.Group>
            <Button
              type="submit"
              variant="primary"
              className="w-100"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Accesso in corso...' : 'Accedi'}
            </Button>
          </Form>
          <p className="text-center mt-3 mb-0">
            Non hai un account? <Link to="/register">Iscriviti ora</Link>
          </p>
        </Card.Body>
      </Card>
    </div>
  )
}
