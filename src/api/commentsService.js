import httpClient from './httpClient'

export async function fetchCommentsByPost(postId) {
  const { data } = await httpClient.get('/comments', {
    params: { postId, _sort: 'createdAt', _order: 'asc' },
  })
  return data
}

export async function createComment(comment) {
  const { data } = await httpClient.post('/comments', comment)
  return data
}

export async function deleteComment(id) {
  await httpClient.delete(`/comments/${id}`)
  return id
}
