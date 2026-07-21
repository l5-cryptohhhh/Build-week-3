import { useState } from 'react'
import Avatar from '../common/Avatar'
import UserHoverCard from '../common/UserHoverCard'
import CommentForm from './CommentForm'
import { formatRelativeTime } from '../../utils/dateFormat'

export default function CommentItem({ comment, author, canEdit, canDelete, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return (
      <div className="d-flex gap-2 mb-2">
        <Avatar user={author} size={28} />
        <div className="flex-grow-1">
          <CommentForm
            initialValue={comment.content}
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
    <div className="d-flex gap-2 mb-2 animate-fade-in">
      <UserHoverCard user={author}>
        <Avatar user={author} size={28} />
      </UserHoverCard>
      <div className="bg-light rounded px-2 py-1 flex-grow-1">
        <div className="d-flex justify-content-between align-items-start">
          <UserHoverCard user={author}>
            <span className="fw-semibold small">{author?.fullName || 'Utente'}</span>
          </UserHoverCard>
          <div className="d-flex align-items-center gap-2">
            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
              {formatRelativeTime(comment.createdAt)}
            </span>
            {canEdit && (
              <button
                type="button"
                className="btn btn-sm btn-link text-secondary p-0"
                onClick={() => setIsEditing(true)}
                aria-label="Modifica commento"
              >
                <i className="bi bi-pencil"></i>
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                className="btn btn-sm btn-link text-danger p-0"
                onClick={onDelete}
                aria-label="Elimina commento"
              >
                <i className="bi bi-trash"></i>
              </button>
            )}
          </div>
        </div>
        <p className="mb-0 small">{comment.content}</p>
      </div>
    </div>
  )
}
