import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'

export default function ErrorAlert({ message, onRetry }) {
  if (!message) return null

  return (
    <Alert variant="danger" className="d-flex justify-content-between align-items-center">
      <span>{message}</span>
      {onRetry && (
        <Button variant="outline-danger" size="sm" className="ms-3" onClick={onRetry}>
          Riprova
        </Button>
      )}
    </Alert>
  )
}
