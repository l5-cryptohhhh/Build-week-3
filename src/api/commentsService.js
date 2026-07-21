import httpClient from './httpClient'

export async function fetchCommentsByPost(postId, { page = 1, limit = 10 } = {}) {
  const { data, headers } = await httpClient.get('/comments', {
    params: { postId, _sort: 'createdAt', _order: 'asc', _page: page, _limit: limit },
  })
  return { comments: data, totalCount: Number(headers['x-total-count'] ?? data.length) }
}

export async function createComment(comment) {
  const { data } = await httpClient.post('/comments', comment)
  return data
}

export async function updateComment(id, changes) {
  const { data } = await httpClient.patch(`/comments/${id}`, changes)
  return data
}

export async function deleteComment(id) {
  await httpClient.delete(`/comments/${id}`)
  return id
}
