import httpClient from './httpClient'

export async function fetchNotificationsForUser(userId) {
  const { data } = await httpClient.get('/notifications', {
    params: { userId, _sort: 'createdAt', _order: 'desc' },
  })
  return data
}

export async function markNotificationRead(id) {
  const { data } = await httpClient.patch(`/notifications/${id}`, { read: true })
  return data
}
