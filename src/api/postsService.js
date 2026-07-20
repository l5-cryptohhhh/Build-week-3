import httpClient from './httpClient'

export async function fetchPosts({ page = 1, limit = 5 } = {}) {
  const { data, headers } = await httpClient.get('/posts', {
    params: { _sort: 'createdAt', _order: 'desc', _page: page, _limit: limit },
  })
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
