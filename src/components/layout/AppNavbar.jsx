import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge'
import { logout, selectCurrentUser } from '../../features/auth/authSlice'
import { selectTotalUnreadMessages } from '../../features/messages/messagesSlice'
import { setSearchQuery } from '../../features/search/searchSlice'
import Avatar from '../common/Avatar'
import NotificationBell from '../notifications/NotificationBell'
import useTheme from '../../hooks/useTheme'

export default function AppNavbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const unreadMessages = useSelector(selectTotalUnreadMessages)
  const [expanded, setExpanded] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [theme, toggleTheme] = useTheme()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    dispatch(setSearchQuery(searchInput))
    navigate('/search')
    setExpanded(false)
  }

  if (!user) return null

  return (
    <Navbar
      bg="body"
      expand="lg"
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

        <Form
          onSubmit={handleSearchSubmit}
          className="flex-grow-1 mx-2 mx-lg-3"
          style={{ minWidth: 0, maxWidth: 280 }}
        >
          <div className="input-group rounded-pill overflow-hidden">
            <span className="input-group-text bg-body-tertiary border-0">
              <i className="bi bi-search text-secondary"></i>
            </span>
            <Form.Control
              type="search"
              placeholder="Cerca..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="border-0 bg-body-tertiary"
            />
          </div>
        </Form>

        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-sm btn-link text-secondary p-0"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Attiva tema chiaro' : 'Attiva tema scuro'}
            title={theme === 'dark' ? 'Attiva tema chiaro' : 'Attiva tema scuro'}
          >
            <i className={`bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon-stars'} fs-5`}></i>
          </button>
          <NotificationBell />
        </div>

        <Navbar.Toggle aria-controls="main-navbar" className="ms-2" />
        <Navbar.Collapse id="main-navbar">
          <div className="d-flex d-lg-none justify-content-center mb-2">
            <Link
              to={`/profile/${user.id}`}
              onClick={() => setExpanded(false)}
              className="d-inline-flex align-items-center text-decoration-none text-dark py-2"
            >
              <Avatar user={user} size={32} className="me-2" />
              {user.fullName}
            </Link>
          </div>
          <Nav className="ms-auto align-items-md-center gap-md-3 text-center text-lg-start">
            <Nav.Link as={NavLink} to="/" end onClick={() => setExpanded(false)}>
              <i className="bi bi-house me-1"></i>Home
            </Nav.Link>
            <Nav.Link as={NavLink} to={`/profile/${user.id}`} onClick={() => setExpanded(false)}>
              <i className="bi bi-person me-1"></i>Il mio profilo
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/messages"
              onClick={() => setExpanded(false)}
              className="position-relative"
            >
              <i className="bi bi-chat-dots me-1"></i>Messaggi
              {unreadMessages > 0 && (
                <Badge bg="danger" pill className="ms-1" style={{ fontSize: '0.6rem' }}>
                  {unreadMessages}
                </Badge>
              )}
            </Nav.Link>
            <Nav.Link as={NavLink} to="/jobs" onClick={() => setExpanded(false)}>
              <i className="bi bi-briefcase me-1"></i>Lavoro
            </Nav.Link>
            <Link
              to={`/profile/${user.id}`}
              onClick={() => setExpanded(false)}
              className="d-none d-lg-inline-flex align-items-center text-decoration-none text-dark py-2"
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
