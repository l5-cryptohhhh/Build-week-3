import { useRef, useState } from 'react'
import { REACTIONS, getReaction } from '../../utils/reactions'

export default function ReactionButton({ reactionType, count, isPopping, onReact, variant = 'button' }) {
  const [showPicker, setShowPicker] = useState(false)
  const [burst, setBurst] = useState(null)
  const closeTimer = useRef(null)
  const burstId = useRef(0)

  const triggerBurst = (type) => {
    const reaction = getReaction(type)
    burstId.current += 1
    setBurst({ id: burstId.current, emoji: reaction ? reaction.emoji : '👍' })
  }

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const openPicker = () => {
    cancelClose()
    setShowPicker(true)
  }

  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setShowPicker(false), 350)
  }

  const active = reactionType ? getReaction(reactionType) : null

  const handlePick = (type) => {
    onReact(type)
    setShowPicker(false)
    triggerBurst(type)
  }

  const handleMainClick = () => {
    const type = reactionType || 'like'
    onReact(type)
    if (!reactionType) triggerBurst(type)
  }

  const burstBadge = burst && (
    <span
      key={burst.id}
      className="reaction-burst"
      aria-hidden="true"
      onAnimationEnd={() => setBurst(null)}
    >
      {burst.emoji}
    </span>
  )

  const picker = showPicker && (
    <div className="reaction-picker" role="menu">
      {REACTIONS.map((reaction) => (
        <button
          key={reaction.type}
          type="button"
          className="reaction-picker-emoji"
          data-label={reaction.label}
          aria-label={reaction.label}
          onClick={() => handlePick(reaction.type)}
        >
          {reaction.emoji}
        </button>
      ))}
    </div>
  )

  if (variant === 'text') {
    return (
      <div
        className="position-relative d-inline-flex align-items-center gap-1"
        onMouseEnter={openPicker}
        onMouseLeave={scheduleClose}
      >
        {picker}
        {burstBadge}
        <span
          role="button"
          tabIndex={0}
          className={`small fw-semibold ${isPopping ? 'like-pop' : ''}`}
          style={{ cursor: 'pointer', color: active ? active.color : 'var(--bs-secondary-color)' }}
          onClick={handleMainClick}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') handleMainClick()
          }}
        >
          {active ? active.label : 'Mi piace'}
        </span>
        {count > 0 && (
          <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
            {active ? active.emoji : ''} {count}
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      className="position-relative d-inline-block"
      onMouseEnter={openPicker}
      onMouseLeave={scheduleClose}
    >
      {picker}
      {burstBadge}
      <button
        type="button"
        className={`btn btn-sm ${active ? '' : 'btn-outline-primary'}`}
        style={
          active
            ? { backgroundColor: active.color, borderColor: active.color, color: '#fff' }
            : undefined
        }
        onClick={handleMainClick}
      >
        <span className={`d-inline-flex align-items-center ${isPopping ? 'like-pop' : ''}`}>
          {active ? (
            <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>{active.emoji}</span>
          ) : (
            <i className="bi bi-hand-thumbs-up"></i>
          )}
        </span>
        <span className="ms-1">{count}</span>
      </button>
    </div>
  )
}
