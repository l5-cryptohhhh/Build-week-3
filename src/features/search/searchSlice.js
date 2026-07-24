import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as usersService from '../../api/usersService'
import * as postsService from '../../api/postsService'

export const searchUsers = createAsyncThunk(
  'search/searchUsers',
  async ({ q, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const { users, hasMore } = await usersService.searchUsers({ q, page, limit })
      return { users, hasMore, page }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const searchPosts = createAsyncThunk(
  'search/searchPosts',
  async ({ q, page = 1, limit = 5 }, { rejectWithValue }) => {
    try {
      const { posts, hasMore } = await postsService.searchPostsByContent({ q, page, limit })
      const likes = await postsService.fetchLikesForPosts(posts.map((post) => post.id))
      return { posts, hasMore, page, likes }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

const initialState = {
  query: '',
  users: { items: [], page: 1, limit: 10, hasMore: false, status: 'idle' },
  posts: { items: [], page: 1, limit: 5, hasMore: false, status: 'idle' },
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
        state.users.hasMore = action.payload.hasMore
        state.users.page = action.payload.page
        // A differenza della paginazione a cursore del feed, la ricerca
        // rifa' ogni volta la query sull'intera finestra (limit * page):
        // qui e' sempre una sostituzione, mai un append.
        state.users.items = action.payload.users
      })
      .addCase(searchUsers.rejected, (state) => {
        state.users.status = 'failed'
      })
      .addCase(searchPosts.pending, (state) => {
        state.posts.status = 'loading'
      })
      .addCase(searchPosts.fulfilled, (state, action) => {
        state.posts.status = 'succeeded'
        state.posts.hasMore = action.payload.hasMore
        state.posts.page = action.payload.page
        state.posts.items = action.payload.posts
      })
      .addCase(searchPosts.rejected, (state) => {
        state.posts.status = 'failed'
      })
      // Ascolta le azioni di postsSlice per tipo (stringa), non importando i
      // thunk direttamente: postsSlice.js importa gia' `searchPosts` da qui,
      // un import nell'altro verso creerebbe un ciclo tra i due moduli (che
      // con `extraReducers` valutati a module-load-time rischia di leggere
      // `updatePost`/`deletePost` ancora `undefined`). Un post modificato o
      // eliminato puo' essere gia' in cache anche nei risultati di ricerca
      // (copia separata in `state.posts.items`), senza questo resterebbe la
      // versione vecchia/cancellata finche' non si rifa' la ricerca.
      .addMatcher(
        (action) => action.type === 'posts/updatePost/fulfilled',
        (state, action) => {
          const index = state.posts.items.findIndex((post) => post.id === action.payload.id)
          if (index !== -1) state.posts.items[index] = action.payload
        },
      )
      .addMatcher(
        (action) => action.type === 'posts/deletePost/fulfilled',
        (state, action) => {
          state.posts.items = state.posts.items.filter((post) => post.id !== action.payload)
        },
      )
  },
})

export const { setSearchQuery } = searchSlice.actions
export default searchSlice.reducer

export const selectSearchQuery = (state) => state.search.query
export const selectSearchUsers = (state) => state.search.users
export const selectSearchPosts = (state) => state.search.posts
