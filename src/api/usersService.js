import httpClient from './httpClient'

export async function getAllUsers() {
  const { data } = await httpClient.get('/users')
  return data
}

export async function getUserById(id) {
  const { data } = await httpClient.get(`/users/${id}`)
  return data
}

export async function updateUser(id, changes) {
  const { data } = await httpClient.patch(`/users/${id}`, changes)
  return data
}

export async function searchUsers({ q, page = 1, limit = 10 } = {}) {
  const { data, headers } = await httpClient.get('/users', {
    params: { q, _page: page, _limit: limit },
  })
  return { users: data, totalCount: Number(headers['x-total-count'] ?? data.length) }
}

export async function fetchFollowers(userId) {
  const { data } = await httpClient.get('/follows', { params: { followingId: userId } })
  return data
}

export async function fetchFollowing(userId) {
  const { data } = await httpClient.get('/follows', { params: { userId } })
  return data
}

export async function followUser({ followerId, followingId }) {
  const { data } = await httpClient.post('/follows', {
    userId: followerId,
    followingId,
    createdAt: new Date().toISOString(),
  })
  return data
}

export async function unfollowUser(followId) {
  await httpClient.delete(`/follows/${followId}`)
  return followId
}
