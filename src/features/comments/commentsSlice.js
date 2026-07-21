import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as commentsService from '../../api/commentsService'

export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async (postId, { rejectWithValue }) => {
    try {
      const comments = await commentsService.fetchCommentsByPost(postId)
      return { postId, comments }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const fetchCommentsForPosts = createAsyncThunk(
  'comments/fetchCommentsForPosts',
  async (postIds, { rejectWithValue }) => {
    try {
      const comments = await commentsService.fetchCommentsForPosts(postIds)
      return { postIds, comments }
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

const initialState = {
  byPostId: {},
  statusByPostId: {},
  error: null,
}

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state, action) => {
        state.statusByPostId[action.meta.arg] = 'loading'
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.byPostId[action.payload.postId] = action.payload.comments
        state.statusByPostId[action.payload.postId] = 'succeeded'
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.statusByPostId[action.meta.arg] = 'failed'
        state.error = action.payload
      })
      .addCase(fetchCommentsForPosts.fulfilled, (state, action) => {
        action.payload.postIds.forEach((postId) => {
          state.byPostId[postId] = action.payload.comments.filter(
            (comment) => comment.postId === postId,
          )
          state.statusByPostId[postId] = 'succeeded'
        })
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const list = state.byPostId[action.payload.postId] || []
        state.byPostId[action.payload.postId] = [...list, action.payload]
      })
      .addCase(removeComment.fulfilled, (state, action) => {
        const list = state.byPostId[action.payload.postId] || []
        state.byPostId[action.payload.postId] = list.filter(
          (comment) => comment.id !== action.payload.id,
        )
      })
  },
})

export default commentsSlice.reducer

export const selectCommentsForPost = (postId) => (state) => state.comments.byPostId[postId] || []
export const selectCommentsStatusForPost = (postId) => (state) =>
  state.comments.statusByPostId[postId] || 'idle'
