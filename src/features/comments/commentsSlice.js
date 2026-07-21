import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as commentsService from '../../api/commentsService'

const COMMENTS_LIMIT = 10

export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async ({ postId, page = 1 }, { rejectWithValue }) => {
    try {
      const { comments, totalCount } = await commentsService.fetchCommentsByPost(postId, {
        page,
        limit: COMMENTS_LIMIT,
      })
      return { postId, comments, totalCount, page }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const addComment = createAsyncThunk(
  'comments/addComment',
  async ({ postId, userId, content }, { rejectWithValue }) => {
    try {
      return await commentsService.createComment({
        postId,
        userId,
        content,
        createdAt: new Date().toISOString(),
      })
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const editComment = createAsyncThunk(
  'comments/editComment',
  async ({ id, postId, content }, { rejectWithValue }) => {
    try {
      const comment = await commentsService.updateComment(id, { content })
      return { ...comment, postId }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const removeComment = createAsyncThunk(
  'comments/removeComment',
  async ({ id, postId }, { rejectWithValue }) => {
    try {
      await commentsService.deleteComment(id)
      return { id, postId }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

const initialPostState = { items: [], page: 1, totalCount: 0 }

const initialState = {
  byPostId: {},
  statusByPostId: {},
  error: null,
}

function getPostState(state, postId) {
  if (!state.byPostId[postId]) state.byPostId[postId] = { ...initialPostState }
  return state.byPostId[postId]
}

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state, action) => {
        state.statusByPostId[action.meta.arg.postId] = 'loading'
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        const { postId, comments, totalCount, page } = action.payload
        const postState = getPostState(state, postId)
        postState.totalCount = totalCount
        postState.page = page
        postState.items = page === 1 ? comments : [...postState.items, ...comments]
        state.statusByPostId[postId] = 'succeeded'
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.statusByPostId[action.meta.arg.postId] = 'failed'
        state.error = action.payload
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const postState = getPostState(state, action.payload.postId)
        postState.items = [...postState.items, action.payload]
        postState.totalCount += 1
      })
      .addCase(editComment.fulfilled, (state, action) => {
        const postState = getPostState(state, action.payload.postId)
        const index = postState.items.findIndex((comment) => comment.id === action.payload.id)
        if (index !== -1) postState.items[index] = action.payload
      })
      .addCase(removeComment.fulfilled, (state, action) => {
        const postState = getPostState(state, action.payload.postId)
        postState.items = postState.items.filter((comment) => comment.id !== action.payload.id)
        postState.totalCount = Math.max(0, postState.totalCount - 1)
      })
  },
})

export default commentsSlice.reducer

export const selectCommentsForPost = (postId) => (state) =>
  state.comments.byPostId[postId]?.items || []
export const selectCommentsStatusForPost = (postId) => (state) =>
  state.comments.statusByPostId[postId] || 'idle'
export const selectCommentsPageForPost = (postId) => (state) =>
  state.comments.byPostId[postId]?.page || 1
export const selectCommentsTotalForPost = (postId) => (state) =>
  state.comments.byPostId[postId]?.totalCount || 0
