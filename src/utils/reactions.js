export const REACTIONS = [
  { type: 'like', emoji: '👍', label: 'Mi piace', color: '#0a66c2' },
  { type: 'celebrate', emoji: '👏', label: 'Festeggia', color: '#44712e' },
  { type: 'support', emoji: '🤗', label: 'Supporto', color: '#7a2f7a' },
  { type: 'love', emoji: '❤️', label: 'Adoro', color: '#df704d' },
  { type: 'insightful', emoji: '💡', label: 'Perspicace', color: '#e7a33e' },
  { type: 'funny', emoji: '😆', label: 'Divertente', color: '#e7a33e' },
]

export function getReaction(type) {
  return REACTIONS.find((reaction) => reaction.type === type) || REACTIONS[0]
}
