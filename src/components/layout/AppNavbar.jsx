import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Button from 'react-bootstrap/Button'
import { logout, selectCurrentUser } from '../../features/auth/authSlice'
import Avatar from '../common/Avatar'

export default function AppNavbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const [expanded, setExpanded] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  if (!user) return null

  return (
    <Navbar
      bg="white"
      expand="md"
      fixed="top"
      className="border-bottom shadow-sm"
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" onClick={() => setExpanded(false)} className="brand-logo">
          <span className="brand-in">in</span>
          <span className="brand-clone">Clone</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end onClick={() => setExpanded(false)}>
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to={`/profile/${user.id}`} onClick={() => setExpanded(false)}>
              Il mio profilo
            </Nav.Link>
            <Nav.Link as={NavLink} to="/messages" onClick={() => setExpanded(false)}>
              <i className="bi bi-chat-dots me-1"></i>Messaggi
            </Nav.Link>
          </Nav>
          <Nav className="align-items-md-center gap-2">
            <Link
              to={`/profile/${user.id}`}
              onClick={() => setExpanded(false)}
              className="d-inline-flex align-items-center text-decoration-none text-dark py-2"
            >
              <Avatar user={user} size={32} className="me-2" />
              {user.fullName}
            </Link>
            <Button variant="outline-secondary" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
