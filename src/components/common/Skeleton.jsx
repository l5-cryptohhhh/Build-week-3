export default function Skeleton({ width = '100%', height = '1rem', rounded = true, className = '' }) {
  return (
    <span
      className={`skeleton d-block ${rounded ? 'rounded' : ''} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}
