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

export async function fetchMessages(conversationId, { page = 1, limit = 20 } = {}) {
  // Pagina 1 = messaggi piu' recenti (ordine desc lato server); si inverte
  // qui per restituire sempre l'ordine cronologico asc atteso dalla UI.
  // Le pagine successive ("carica precedenti") vanno anteposte dal chiamante.
  const { data, headers } = await httpClient.get('/messages', {
    params: { conversationId, _sort: 'createdAt', _order: 'desc', _page: page, _limit: limit },
  })
  return { messages: data.reverse(), totalCount: Number(headers['x-total-count'] ?? data.length) }
}

export async function sendMessage(message) {
  const { data } = await httpClient.post('/messages', message)
  return data
}

export async function markMessageRead(id) {
  const { data } = await httpClient.patch(`/messages/${id}`, { read: true })
  return data
}

export async function fetchUnreadCount(conversationId, userId) {
  const { data } = await httpClient.get('/messages', {
    params: { conversationId, read: false },
  })
  return data.filter((message) => message.userId !== userId).length
}

export async function updateMessage(id, changes) {
  const { data } = await httpClient.patch(`/messages/${id}`, changes)
  return data
}

export async function deleteMessage(id) {
  await httpClient.delete(`/messages/${id}`)
  return id
}
