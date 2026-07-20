export default function EmptyState({ icon = 'bi-inbox', title, description }) {
  return (
    <div className="text-center text-secondary py-5">
      <i className={`bi ${icon} display-4 d-block mb-3`}></i>
      <p className="fw-semibold mb-1">{title}</p>
      {description && <p className="mb-0">{description}</p>}
    </div>
  )
}
