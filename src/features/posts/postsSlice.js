import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as postsService from '../../api/postsService'
import { searchPosts } from '../search/searchSlice'

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async ({ page = 1, limit = 5 } = {}, { rejectWithValue }) => {
    try {
      const { posts, totalCount } = await postsService.fetchPosts({ page, limit })
      const likes = await postsService.fetchLikesForPosts(posts.map((post) => post.id))
      return { posts, totalCount, likes, page }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const fetchFollowingFeed = createAsyncThunk(
  'posts/fetchFollowingFeed',
  async ({ page = 1, limit = 5, followingIds }, { rejectWithValue }) => {
    try {
      const { posts, totalCount } = await postsService.fetchPosts({ page, limit, userIds: followingIds })
      const likes = await postsService.fetchLikesForPosts(posts.map((post) => post.id))
      return { posts, totalCount, likes, page }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const fetchPostsByUser = createAsyncThunk(
  'posts/fetchPostsByUser',
  async (userId, { rejectWithValue }) => {
    try {
      const posts = await postsService.fetchPostsByUser(userId)
      const likes = await postsService.fetchLikesForPosts(posts.map((post) => post.id))
      return { userId, posts, likes }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      return await postsService.createPost(postData)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ id, changes }, { rejectWithValue }) => {
    try {
      return await postsService.updatePost(id, changes)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (id, { rejectWithValue }) => {
    try {
      return await postsService.deletePost(id)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const toggleLike = createAsyncThunk(
  'posts/toggleLike',
  async ({ postId, userId }, { getState, rejectWithValue }) => {
    try {
      const existing = getState().posts.likes.find(
        (like) => like.postId === postId && like.userId === userId,
      )
      if (existing) {
        await postsService.unlikePost(existing.id)
        return { postId, liked: false, likeId: existing.id }
      }
      const like = await postsService.likePost({ postId, userId })
      return { postId, liked: true, like }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

const initialState = {
  items: [],
  likes: [],
  status: 'idle',
  error: null,
  page: 1,
  limit: 5,
  totalCount: 0,
  byUserId: {},
  statusByUserId: {},
  followingFeed: { items: [], likes: [], page: 1, limit: 5, totalCount: 0, status: 'idle' },
}

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.totalCount = action.payload.totalCount
        state.page = action.payload.page
        if (action.payload.page === 1) {
          state.items = action.payload.posts
          state.likes = action.payload.likes
        } else {
          state.items = [...state.items, ...action.payload.posts]
          state.likes = [...state.likes, ...action.payload.likes]
        }
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Impossibile caricare i post.'
      })
      .addCase(fetchFollowingFeed.pending, (state) => {
        state.followingFeed.status = 'loading'
      })
      .addCase(fetchFollowingFeed.fulfilled, (state, action) => {
        state.followingFeed.status = 'succeeded'
        state.followingFeed.totalCount = action.payload.totalCount
        state.followingFeed.page = action.payload.page
        state.followingFeed.items =
          action.payload.page === 1
            ? action.payload.posts
            : [...state.followingFeed.items, ...action.payload.posts]
        const existingLikeIds = new Set(state.likes.map((like) => like.id))
        action.payload.likes.forEach((like) => {
          if (!existingLikeIds.has(like.id)) state.likes.push(like)
        })
      })
      .addCase(fetchFollowingFeed.rejected, (state) => {
        state.followingFeed.status = 'failed'
      })
      .addCase(fetchPostsByUser.pending, (state, action) => {
        state.statusByUserId[action.meta.arg] = 'loading'
      })
      .addCase(fetchPostsByUser.fulfilled, (state, action) => {
        state.statusByUserId[action.payload.userId] = 'succeeded'
        state.byUserId[action.payload.userId] = action.payload.posts
        const existingLikeIds = new Set(state.likes.map((like) => like.id))
        action.payload.likes.forEach((like) => {
          if (!existingLikeIds.has(like.id)) state.likes.push(like)
        })
      })
      .addCase(fetchPostsByUser.rejected, (state, action) => {
        state.statusByUserId[action.meta.arg] = 'failed'
      })
      .addCase(searchPosts.fulfilled, (state, action) => {
        const existingLikeIds = new Set(state.likes.map((like) => like.id))
        action.payload.likes.forEach((like) => {
          if (!existingLikeIds.has(like.id)) state.likes.push(like)
        })
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
        state.totalCount += 1
        const userId = action.payload.userId
        if (state.byUserId[userId]) {
          state.byUserId[userId] = [action.payload, ...state.byUserId[userId]]
        }
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.items.findIndex((post) => post.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
        const userId = action.payload.userId
        const userIndex = state.byUserId[userId]?.findIndex((post) => post.id === action.payload.id)
        if (userIndex !== undefined && userIndex !== -1) {
          state.byUserId[userId][userIndex] = action.payload
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.items = state.items.filter((post) => post.id !== action.payload)
        state.totalCount -= 1
        Object.keys(state.byUserId).forEach((userId) => {
          state.byUserId[userId] = state.byUserId[userId].filter(
            (post) => post.id !== action.payload,
          )
        })
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        if (action.payload.liked) {
          state.likes.push(action.payload.like)
        } else {
          state.likes = state.likes.filter((like) => like.id !== action.payload.likeId)
        }
      })
  },
})

export default postsSlice.reducer

export const selectAllPosts = (state) => state.posts.items
export const selectPostsStatus = (state) => state.posts.status
export const selectPostsError = (state) => state.posts.error
export const selectPostsPage = (state) => state.posts.page
export const selectPostsLimit = (state) => state.posts.limit
export const selectPostsTotalCount = (state) => state.posts.totalCount
export const selectLikesForPost = (postId) => (state) =>
  state.posts.likes.filter((like) => like.postId === postId)
export const selectPostsByUser = (userId) => (state) => state.posts.byUserId[userId] || []
export const selectPostsByUserStatus = (userId) => (state) =>
  state.posts.statusByUserId[userId] || 'idle'
export const selectFollowingFeed = (state) => state.posts.followingFeed
