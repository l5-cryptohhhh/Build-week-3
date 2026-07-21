import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as usersService from '../../api/usersService'
import * as postsService from '../../api/postsService'

export const searchUsers = createAsyncThunk(
  'search/searchUsers',
  async ({ q, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const { users, totalCount } = await usersService.searchUsers({ q, page, limit })
      return { users, totalCount, page }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const searchPosts = createAsyncThunk(
  'search/searchPosts',
  async ({ q, page = 1, limit = 5 }, { rejectWithValue }) => {
    try {
      const { posts, totalCount } = await postsService.fetchPosts({ q, page, limit })
      const likes = await postsService.fetchLikesForPosts(posts.map((post) => post.id))
      return { posts, totalCount, page, likes }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

const initialState = {
  query: '',
  users: { items: [], page: 1, limit: 10, totalCount: 0, status: 'idle' },
  posts: { items: [], page: 1, limit: 5, totalCount: 0, status: 'idle' },
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery(state, action) {
      state.query = action.payload
      state.users = initialState.users
      state.posts = initialState.posts
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchUsers.pending, (state) => {
        state.users.status = 'loading'
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.users.status = 'succeeded'
        state.users.totalCount = action.payload.totalCount
        state.users.page = action.payload.page
        state.users.items =
          action.payload.page === 1
            ? action.payload.users
            : [...state.users.items, ...action.payload.users]
      })
      .addCase(searchUsers.rejected, (state) => {
        state.users.status = 'failed'
      })
      .addCase(searchPosts.pending, (state) => {
        state.posts.status = 'loading'
      })
      .addCase(searchPosts.fulfilled, (state, action) => {
        state.posts.status = 'succeeded'
        state.posts.totalCount = action.payload.totalCount
        state.posts.page = action.payload.page
        state.posts.items =
          action.payload.page === 1
            ? action.payload.posts
            : [...state.posts.items, ...action.payload.posts]
      })
      .addCase(searchPosts.rejected, (state) => {
        state.posts.status = 'failed'
      })
  },
})

export const { setSearchQuery } = searchSlice.actions
export default searchSlice.reducer

export const selectSearchQuery = (state) => state.search.query
export const selectSearchUsers = (state) => state.search.users
export const selectSearchPosts = (state) => state.search.posts
