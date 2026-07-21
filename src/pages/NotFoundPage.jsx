import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 text-center px-3 animate-fade-in">
      <div className="empty-state-icon-circle mb-4" style={{ width: 96, height: 96, fontSize: '2.5rem' }}>
        <i className="bi bi-signpost-split"></i>
      </div>
      <h1 className="display-5 fw-bold mb-2">404</h1>
      <p className="text-secondary mb-4">La pagina che cerchi non esiste o è stata spostata.</p>
      <Link to="/" className="btn btn-primary">
        <i className="bi bi-house-door me-1"></i>Torna alla home
      </Link>
    </div>
  )
}
