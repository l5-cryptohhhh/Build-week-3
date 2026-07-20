import Avatar from '../common/Avatar'
import { formatRelativeTime } from '../../utils/dateFormat'

export default function CommentItem({ comment, author, canDelete, onDelete }) {
  return (
    <div className="d-flex gap-2 mb-2">
      <Avatar user={author} size={28} />
      <div className="bg-light rounded px-2 py-1 flex-grow-1">
        <div className="d-flex justify-content-between align-items-start">
          <span className="fw-semibold small">{author?.fullName || 'Utente'}</span>
          <div className="d-flex align-items-center gap-2">
            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
              {formatRelativeTime(comment.createdAt)}
            </span>
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
