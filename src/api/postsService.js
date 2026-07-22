import httpClient from './httpClient'

export async function fetchPosts({ page = 1, limit = 5, q, userIds } = {}) {
  // json-server tratta piu' valori dello stesso parametro come filtro OR
  // (stessa tecnica gia' usata in fetchLikesForPosts per piu' postId).
  const params = new URLSearchParams()
  params.set('_sort', 'createdAt')
  params.set('_order', 'desc')
  params.set('_page', page)
  params.set('_limit', limit)
  if (q) params.set('q', q)
  if (userIds) userIds.forEach((id) => params.append('userId', id))
  const { data, headers } = await httpClient.get(`/posts?${params.toString()}`)
  return { posts: data, totalCount: Number(headers['x-total-count'] ?? data.length) }
}

export async function fetchPostsByUser(userId) {
  const { data } = await httpClient.get('/posts', {
    params: { userId, _sort: 'createdAt', _order: 'desc' },
  })
  return data
}

export async function fetchPostById(id) {
  const { data } = await httpClient.get(`/posts/${id}`)
  return data
}

export async function createPost(post) {
  const { data } = await httpClient.post('/posts', post)
  return data
}

export async function updatePost(id, changes) {
  const { data } = await httpClient.patch(`/posts/${id}`, changes)
  return data
}

export async function deletePost(id) {
  await httpClient.delete(`/posts/${id}`)
  return id
}

export async function fetchPostsByIds(ids) {
  if (!ids.length) return []
  const params = new URLSearchParams()
  ids.forEach((id) => params.append('id', id))
  const { data } = await httpClient.get(`/posts?${params.toString()}`)
  return data
}

export async function fetchLikesForPosts(postIds) {
  if (!postIds.length) return []
  const params = new URLSearchParams()
  postIds.forEach((id) => params.append('postId', id))
  const { data } = await httpClient.get(`/likes?${params.toString()}`)
  return data
}

export async function likePost({ postId, userId }) {
  const { data } = await httpClient.post('/likes', { postId, userId })
  return data
}

export async function unlikePost(likeId) {
  await httpClient.delete(`/likes/${likeId}`)
  return likeId
}
