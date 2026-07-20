function getInitials(fullName = '') {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export default function Avatar({ user, size = 40, className = '' }) {
  const style = { width: size, height: size, fontSize: size * 0.4, flexShrink: 0 }

  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.fullName}
        className={`rounded-circle object-fit-cover ${className}`}
        style={style}
      />
    )
  }

  return (
    <span
      className={`rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center fw-semibold ${className}`}
      style={style}
    >
      {getInitials(user?.fullName) || '?'}
    </span>
  )
}
