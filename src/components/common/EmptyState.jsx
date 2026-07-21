export default function EmptyState({ icon = 'bi-inbox', title, description }) {
  return (
    <div className="text-center text-secondary py-5 empty-state-fade">
      <div className="empty-state-icon-circle mx-auto mb-3">
        <i className={`bi ${icon}`}></i>
      </div>
      <p className="fw-semibold mb-1">{title}</p>
      {description && <p className="mb-0">{description}</p>}
    </div>
  )
}
