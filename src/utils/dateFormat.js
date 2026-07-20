const formatter = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatDateTime(isoString) {
  if (!isoString) return ''
  return formatter.format(new Date(isoString))
}

export function formatRelativeTime(isoString) {
  if (!isoString) return ''
  const diffMs = Date.now() - new Date(isoString).getTime()
  const diffMinutes = Math.round(diffMs / 60000)

  if (diffMinutes < 1) return 'adesso'
  if (diffMinutes < 60) return `${diffMinutes} min fa`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} h fa`
  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 7) return `${diffDays} g fa`
  return formatDateTime(isoString)
}
