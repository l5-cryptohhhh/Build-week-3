import { useState } from 'react'
import { formatRelativeTime } from '../../utils/dateFormat'
import MessageForm from './MessageForm'

export default function MessageBubble({ message, isOwn, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return (
      <div className="mb-2 d-flex justify-content-end">
        <div style={{ maxWidth: '75%', width: '100%' }}>
          <MessageForm
            initialValue={message.content}
            submitLabel="Salva"
            onSubmit={(content) => {
              onEdit(content)
              setIsEditing(false)
            }}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`d-flex mb-2 ${isOwn ? 'justify-content-end' : 'justify-content-start'}`}>
      <div
        className={`d-flex align-items-end gap-1 ${isOwn ? 'flex-row-reverse' : ''}`}
        style={{ maxWidth: '75%' }}
      >
        <div className={`px-3 py-2 rounded-3 ${isOwn ? 'bg-primary text-white' : 'bg-light'}`}>
          <p className="mb-1" style={{ whiteSpace: 'pre-wrap' }}>
            {message.content}
          </p>
          <div
            className={isOwn ? 'text-white-50 text-end' : 'text-secondary text-end'}
            style={{ fontSize: '0.7rem' }}
          >
            {formatRelativeTime(message.createdAt)}
          </div>
        </div>
        {isOwn && (
          <div className="d-flex flex-column">
            <button
              type="button"
              className="btn btn-sm btn-link text-secondary p-0"
              onClick={() => setIsEditing(true)}
              aria-label="Modifica messaggio"
            >
              <i className="bi bi-pencil" style={{ fontSize: '0.75rem' }}></i>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-link text-danger p-0"
              onClick={onDelete}
              aria-label="Elimina messaggio"
            >
              <i className="bi bi-trash" style={{ fontSize: '0.75rem' }}></i>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
