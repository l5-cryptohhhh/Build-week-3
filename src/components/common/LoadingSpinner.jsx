import Spinner from 'react-bootstrap/Spinner'

export default function LoadingSpinner({ label = 'Caricamento in corso...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-secondary">
      <Spinner animation="border" role="status" className="mb-2" />
      <span>{label}</span>
    </div>
  )
}
