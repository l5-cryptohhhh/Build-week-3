import { useEffect, useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

export default function ConfirmModalHost() {
  const [request, setRequest] = useState(null)

  useEffect(() => {
    function handleRequest(event) {
      setRequest(event.detail)
    }
    window.addEventListener('confirm:request', handleRequest)
    return () => window.removeEventListener('confirm:request', handleRequest)
  }, [])

  const resolveAndClose = (result) => {
    request?.resolve(result)
    setRequest(null)
  }

  return (
    <Modal show={Boolean(request)} onHide={() => resolveAndClose(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title className="h6 mb-0">{request?.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{request?.message}</Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" size="sm" onClick={() => resolveAndClose(false)}>
          Annulla
        </Button>
        <Button variant={request?.variant} size="sm" onClick={() => resolveAndClose(true)}>
          {request?.confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
