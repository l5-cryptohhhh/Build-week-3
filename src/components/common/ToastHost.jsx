import { useEffect, useState } from 'react'
import ToastContainer from 'react-bootstrap/ToastContainer'
import Toast from 'react-bootstrap/Toast'

let nextId = 1

export default function ToastHost() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    function handleShow(event) {
      const id = nextId++
      const { message, variant } = event.detail
      setToasts((prev) => [...prev, { id, message, variant }])
    }

    window.addEventListener('toast:show', handleShow)
    return () => window.removeEventListener('toast:show', handleShow)
  }, [])

  const removeToast = (id) => setToasts((prev) => prev.filter((toast) => toast.id !== id))

  return (
    <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 1080 }}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          bg={toast.variant}
          onClose={() => removeToast(toast.id)}
          delay={3500}
          autohide
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  )
}
