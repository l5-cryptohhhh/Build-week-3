import httpClient from './httpClient'

export async function fetchConversationsForUser(userId) {
  const [asParticipant1, asParticipant2] = await Promise.all([
    httpClient.get('/conversations', { params: { participant1Id: userId } }),
    httpClient.get('/conversations', { params: { participant2Id: userId } }),
  ])
  return [...asParticipant1.data, ...asParticipant2.data]
}

export async function createConversation({ participant1Id, participant2Id }) {
  const { data } = await httpClient.post('/conversations', {
    participant1Id,
    participant2Id,
    createdAt: new Date().toISOString(),
  })
  return data
}

export async function fetchMessages(conversationId) {
  const { data } = await httpClient.get('/messages', {
    params: { conversationId, _sort: 'createdAt', _order: 'asc' },
  })
  return data
}

export async function fetchUnreadMessages(conversationIds, userId) {
  if (!conversationIds.length) return []
  const params = new URLSearchParams()
  conversationIds.forEach((id) => params.append('conversationId', id))
  params.append('read', 'false')
  params.append('userId_ne', userId)
  const { data } = await httpClient.get(`/messages?${params.toString()}`)
  return data
}

export async function sendMessage(message) {
  const { data } = await httpClient.post('/messages', message)
  return data
}

export async function markMessageRead(id) {
  const { data } = await httpClient.patch(`/messages/${id}`, { read: true })
  return data
}

export async function updateMessage(id, changes) {
  const { data } = await httpClient.patch(`/messages/${id}`, changes)
  return data
}

export async function deleteMessage(id) {
  await httpClient.delete(`/messages/${id}`)
  return id
}
