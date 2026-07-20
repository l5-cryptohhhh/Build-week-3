import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 text-center px-3">
      <h1 className="display-4">404</h1>
      <p className="mb-4">La pagina che cerchi non esiste.</p>
      <Link to="/" className="btn btn-primary">
        Torna alla home
      </Link>
    </div>
  )
}
