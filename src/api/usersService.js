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
