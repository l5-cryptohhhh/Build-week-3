import { useState } from 'react'

const GRADIENT_COUNT = 6

function getInitials(fullName = '') {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function getGradientClass(user) {
  const seed = user?.id ?? user?.fullName ?? ''
  const hash = String(seed)
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return `avatar-gradient-${hash % GRADIENT_COUNT}`
}

export default function Avatar({ user, size = 40, className = '', online = false }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const style = { width: size, height: size, fontSize: size * 0.4, flexShrink: 0 }

  const inner = user?.avatarUrl ? (
    <img
      src={user.avatarUrl}
      alt={user.fullName}
      onLoad={() => setIsLoaded(true)}
      className={`rounded-circle object-fit-cover ${className} fade-img ${isLoaded ? 'fade-img-loaded' : ''}`}
      style={style}
    />
  ) : (
    <span
      className={`rounded-circle text-white d-inline-flex align-items-center justify-content-center fw-semibold ${getGradientClass(user)} ${className}`}
      style={style}
    >
      {getInitials(user?.fullName) || '?'}
    </span>
  )

  if (!online) return inner

  return (
    <span className="position-relative d-inline-block" style={{ lineHeight: 0 }}>
      {inner}
      <span className="online-dot" aria-label="Online"></span>
    </span>
  )
}
