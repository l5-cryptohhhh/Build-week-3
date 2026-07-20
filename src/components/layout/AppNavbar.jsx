import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import NavDropdown from 'react-bootstrap/NavDropdown'
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
        <Navbar.Brand as={Link} to="/" onClick={() => setExpanded(false)} className="fw-bold">
          <i className="bi bi-chat-square-heart-fill text-primary me-2"></i>
          SocialApp
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end onClick={() => setExpanded(false)}>
              <i className="bi bi-house-door me-1"></i>Feed
            </Nav.Link>
            <Nav.Link as={NavLink} to="/messages" onClick={() => setExpanded(false)}>
              <i className="bi bi-chat-dots me-1"></i>Messaggi
            </Nav.Link>
          </Nav>
          <Nav>
            <NavDropdown
              align="end"
              title={
                <span className="d-inline-flex align-items-center">
                  <Avatar user={user} size={32} className="me-2" />
                  {user.fullName}
                </span>
              }
              id="user-menu"
            >
              <NavDropdown.Item
                as={Link}
                to={`/profile/${user.id}`}
                onClick={() => setExpanded(false)}
              >
                <i className="bi bi-person me-2"></i>Il mio profilo
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>Esci
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
