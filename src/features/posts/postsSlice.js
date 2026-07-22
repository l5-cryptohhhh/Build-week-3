import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as postsService from '../../api/postsService'
import { searchPosts } from '../search/searchSlice'

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async ({ cursor, limit = 5 } = {}, { rejectWithValue }) => {
    try {
      const { posts, hasMore, nextCursor } = await postsService.fetchPosts({ cursor, limit })
      const likes = await postsService.fetchLikesForPosts(posts.map((post) => post.id))
      return { posts, hasMore, nextCursor, likes, isFirstPage: !cursor }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const fetchFollowingFeed = createAsyncThunk(
  'posts/fetchFollowingFeed',
  async ({ cursor, limit = 5, followingIds }, { rejectWithValue }) => {
    try {
      const { posts, hasMore, nextCursor } = await postsService.fetchPosts({
        cursor,
        limit,
        userIds: followingIds,
      })
      const likes = await postsService.fetchLikesForPosts(posts.map((post) => post.id))
      return { posts, hasMore, nextCursor, likes, isFirstPage: !cursor }
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

export const fetchSavedPosts = createAsyncThunk(
  'posts/fetchSavedPosts',
  async (postIds, { rejectWithValue }) => {
    try {
      const posts = await postsService.fetchPostsByIds(postIds)
      const likes = await postsService.fetchLikesForPosts(posts.map((post) => post.id))
      return { posts, likes }
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
  cursor: null,
  hasMore: true,
  limit: 5,
  byUserId: {},
  statusByUserId: {},
  followingFeed: { items: [], likes: [], cursor: null, hasMore: true, limit: 5, status: 'idle' },
  saved: { items: [], status: 'idle' },
}

// Un post/like puo' arrivare sia dal socket (broadcast a tutti, incluso il
// mittente) sia dal thunk locale che lo ha creato: il dedup by id evita il
// doppione quando i due percorsi si incrociano.
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postReceived(state, action) {
      if (state.items.some((post) => post.id === action.payload.id)) return
      state.items.unshift(action.payload)
    },
    postUpdatedFromSocket(state, action) {
      const post = action.payload
      const index = state.items.findIndex((item) => item.id === post.id)
      if (index !== -1) state.items[index] = post
      const userIndex = state.byUserId[post.userId]?.findIndex((item) => item.id === post.id)
      if (userIndex !== undefined && userIndex !== -1) state.byUserId[post.userId][userIndex] = post
      const followingIndex = state.followingFeed.items.findIndex((item) => item.id === post.id)
      if (followingIndex !== -1) state.followingFeed.items[followingIndex] = post
    },
    postDeletedFromSocket(state, action) {
      const { id } = action.payload
      if (!state.items.some((post) => post.id === id)) return
      state.items = state.items.filter((post) => post.id !== id)
      Object.keys(state.byUserId).forEach((userId) => {
        state.byUserId[userId] = state.byUserId[userId].filter((post) => post.id !== id)
      })
      state.followingFeed.items = state.followingFeed.items.filter((post) => post.id !== id)
    },
    likeReceived(state, action) {
      if (state.likes.some((like) => like.id === action.payload.id)) return
      state.likes.push(action.payload)
    },
    likeRemovedFromSocket(state, action) {
      state.likes = state.likes.filter((like) => like.id !== action.payload.id)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.hasMore = action.payload.hasMore
        state.cursor = action.payload.nextCursor
        if (action.payload.isFirstPage) {
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
        state.followingFeed.hasMore = action.payload.hasMore
        state.followingFeed.cursor = action.payload.nextCursor
        state.followingFeed.items = action.payload.isFirstPage
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
        // Dedup by id: il listener realtime (postReceived) puo' ricevere
        // l'eco della scrittura locale prima ancora che questo thunk si
        // risolva, altrimenti l'autore vedrebbe il proprio post due volte
        // in cima al feed.
        if (!state.items.some((post) => post.id === action.payload.id)) {
          state.items.unshift(action.payload)
        }
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
        // Un post modificato puo' essere gia' in cache anche nel feed "Chi
        // segui" (copia separata, non un riferimento a `items`): senza
        // questo resterebbe la versione vecchia li' finche' non si rifa' il
        // fetch.
        const followingIndex = state.followingFeed.items.findIndex(
          (post) => post.id === action.payload.id,
        )
        if (followingIndex !== -1) state.followingFeed.items[followingIndex] = action.payload
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.items = state.items.filter((post) => post.id !== action.payload)
        Object.keys(state.byUserId).forEach((userId) => {
          state.byUserId[userId] = state.byUserId[userId].filter(
            (post) => post.id !== action.payload,
          )
        })
        state.followingFeed.items = state.followingFeed.items.filter(
          (post) => post.id !== action.payload,
        )
      })
      .addCase(fetchSavedPosts.pending, (state) => {
        state.saved.status = 'loading'
      })
      .addCase(fetchSavedPosts.fulfilled, (state, action) => {
        state.saved.status = 'succeeded'
        state.saved.items = action.payload.posts
        const existingLikeIds = new Set(state.likes.map((like) => like.id))
        action.payload.likes.forEach((like) => {
          if (!existingLikeIds.has(like.id)) state.likes.push(like)
        })
      })
      .addCase(fetchSavedPosts.rejected, (state) => {
        state.saved.status = 'failed'
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        if (action.payload.liked) {
          // Dedup by id: il listener realtime (likeReceived) puo' ricevere
          // l'eco della scrittura locale prima ancora che questo thunk si
          // risolva, altrimenti il like risulterebbe conteggiato due volte.
          const like = action.payload.like
          if (!state.likes.some((item) => item.id === like.id)) {
            state.likes.push(like)
          }
        } else {
          state.likes = state.likes.filter((like) => like.id !== action.payload.likeId)
        }
      })
  },
})

export const {
  postReceived,
  postUpdatedFromSocket,
  postDeletedFromSocket,
  likeReceived,
  likeRemovedFromSocket,
} = postsSlice.actions
export default postsSlice.reducer

export const selectAllPosts = (state) => state.posts.items
export const selectPostsStatus = (state) => state.posts.status
export const selectPostsError = (state) => state.posts.error
export const selectPostsCursor = (state) => state.posts.cursor
export const selectPostsLimit = (state) => state.posts.limit
export const selectPostsHasMore = (state) => state.posts.hasMore
export const selectLikesForPost = (postId) => (state) =>
  state.posts.likes.filter((like) => like.postId === postId)
export const selectPostsByUser = (userId) => (state) => state.posts.byUserId[userId] || []
export const selectPostsByUserStatus = (userId) => (state) =>
  state.posts.statusByUserId[userId] || 'idle'
export const selectFollowingFeed = (state) => state.posts.followingFeed
export const selectSavedPosts = (state) => state.posts.saved.items
export const selectSavedPostsStatus = (state) => state.posts.saved.status
