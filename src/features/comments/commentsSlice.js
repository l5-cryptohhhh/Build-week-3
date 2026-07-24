import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as commentsService from '../../api/commentsService'

const COMMENTS_LIMIT = 10

export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async ({ postId, cursor }, { rejectWithValue }) => {
    try {
      const { comments, hasMore, nextCursor } = await commentsService.fetchCommentsByPost(postId, {
        cursor,
        limit: COMMENTS_LIMIT,
      })
      const likes = await commentsService.fetchLikesForComments(comments.map((comment) => comment.id))
      return { postId, comments, likes, hasMore, nextCursor, isFirstPage: !cursor }
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

// Conteggio separato dalla lista paginata (vedi countCommentsForPost): serve
// a mostrare il numero di commenti sotto un post anche prima di aprirne la
// lista, senza scaricarne il contenuto.
export const fetchCommentsCount = createAsyncThunk(
  'comments/fetchCommentsCount',
  async (postId, { rejectWithValue }) => {
    try {
      const count = await commentsService.countCommentsForPost(postId)
      return { postId, count }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

// Un utente ha al piu' una reaction per commento (stesso principio di
// postsSlice.toggleLike, vedi CHECKPOINT.md): la security rule su
// `commentLikes` nega l'update, quindi cambiare tipo di reaction elimina il
// documento esistente e ne ricrea uno con lo stesso id invece di un update
// in place.
export const toggleCommentLike = createAsyncThunk(
  'comments/toggleCommentLike',
  async ({ commentId, postId, userId, type = 'like' }, { getState, rejectWithValue }) => {
    try {
      const existing = getState().comments.likes.find(
        (like) => like.commentId === commentId && like.userId === userId,
      )
      if (existing && (existing.type || 'like') === type) {
        await commentsService.unlikeComment(existing.id)
        return { commentId, liked: false, likeId: existing.id }
      }
      if (existing) {
        await commentsService.unlikeComment(existing.id)
      }
      const like = await commentsService.likeComment({ commentId, postId, userId, type })
      return { commentId, liked: true, like, replacedId: existing?.id }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

const initialState = {
  byPostId: {},
  statusByPostId: {},
  countByPostId: {},
  countStatusByPostId: {},
  likes: [],
  error: null,
}

// Ogni postId deve avere il proprio array `items`: un oggetto letterale
// condiviso a livello di modulo (`{ ...initialPostState }`, shallow copy)
// farebbe puntare tutti i postId non ancora fetchati allo stesso array,
// che Immer congela (autoFreeze) dopo il primo reducer che lo tocca -
// il primo `.push()` su un SECONDO postId che condivide quel riferimento
// crasha con "Cannot add property, object is not extensible".
function getPostState(state, postId) {
  if (!state.byPostId[postId]) state.byPostId[postId] = { items: [], cursor: null, hasMore: true }
  return state.byPostId[postId]
}

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    commentReceived(state, action) {
      const postId = action.payload.postId
      const postState = getPostState(state, postId)
      if (postState.items.some((comment) => comment.id === action.payload.id)) return
      postState.items.push(action.payload)
      if (state.countByPostId[postId] !== undefined) state.countByPostId[postId] += 1
    },
    commentUpdatedFromSocket(state, action) {
      const postState = getPostState(state, action.payload.postId)
      const index = postState.items.findIndex((comment) => comment.id === action.payload.id)
      if (index !== -1) postState.items[index] = action.payload
    },
    commentDeletedFromSocket(state, action) {
      const postId = action.payload.postId
      const postState = getPostState(state, postId)
      if (!postState.items.some((comment) => comment.id === action.payload.id)) return
      postState.items = postState.items.filter((comment) => comment.id !== action.payload.id)
      if (state.countByPostId[postId] !== undefined) {
        state.countByPostId[postId] = Math.max(0, state.countByPostId[postId] - 1)
      }
      state.likes = state.likes.filter((like) => like.commentId !== action.payload.id)
    },
    commentLikeReceived(state, action) {
      if (state.likes.some((like) => like.id === action.payload.id)) return
      state.likes.push(action.payload)
    },
    commentLikeRemovedFromSocket(state, action) {
      state.likes = state.likes.filter((like) => like.id !== action.payload.id)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state, action) => {
        state.statusByPostId[action.meta.arg.postId] = 'loading'
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        const { postId, comments, hasMore, nextCursor, isFirstPage } = action.payload
        const postState = getPostState(state, postId)
        postState.hasMore = hasMore
        postState.cursor = nextCursor
        postState.items = isFirstPage ? comments : [...postState.items, ...comments]
        state.statusByPostId[postId] = 'succeeded'
        const existingLikeIds = new Set(state.likes.map((like) => like.id))
        action.payload.likes.forEach((like) => {
          if (!existingLikeIds.has(like.id)) state.likes.push(like)
        })
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.statusByPostId[action.meta.arg.postId] = 'failed'
        state.error = action.payload
      })
      .addCase(addComment.fulfilled, (state, action) => {
        // Dedup by id: Firestore echeggia la scrittura locale sul listener
        // realtime (commentReceived) prima ancora che questo thunk si
        // risolva (la promise di addDoc aspetta l'ack del server, il
        // listener locale invece scatta subito sulla cache) - senza
        // controllo, chi commenta vedrebbe il proprio commento due volte.
        const postId = action.payload.postId
        const postState = getPostState(state, postId)
        if (postState.items.some((comment) => comment.id === action.payload.id)) return
        postState.items = [...postState.items, action.payload]
        if (state.countByPostId[postId] !== undefined) state.countByPostId[postId] += 1
      })
      .addCase(editComment.fulfilled, (state, action) => {
        const postState = getPostState(state, action.payload.postId)
        const index = postState.items.findIndex((comment) => comment.id === action.payload.id)
        if (index !== -1) postState.items[index] = action.payload
      })
      .addCase(removeComment.fulfilled, (state, action) => {
        const postId = action.payload.postId
        const postState = getPostState(state, postId)
        postState.items = postState.items.filter((comment) => comment.id !== action.payload.id)
        if (state.countByPostId[postId] !== undefined) {
          state.countByPostId[postId] = Math.max(0, state.countByPostId[postId] - 1)
        }
        state.likes = state.likes.filter((like) => like.commentId !== action.payload.id)
      })
      .addCase(toggleCommentLike.fulfilled, (state, action) => {
        if (action.payload.liked) {
          if (action.payload.replacedId) {
            state.likes = state.likes.filter((like) => like.id !== action.payload.replacedId)
          }
          const like = action.payload.like
          if (!state.likes.some((item) => item.id === like.id)) {
            state.likes.push(like)
          }
        } else {
          state.likes = state.likes.filter((like) => like.id !== action.payload.likeId)
        }
      })
      .addCase(fetchCommentsCount.pending, (state, action) => {
        state.countStatusByPostId[action.meta.arg] = 'loading'
      })
      .addCase(fetchCommentsCount.fulfilled, (state, action) => {
        state.countByPostId[action.payload.postId] = action.payload.count
        state.countStatusByPostId[action.payload.postId] = 'succeeded'
      })
      .addCase(fetchCommentsCount.rejected, (state, action) => {
        state.countStatusByPostId[action.meta.arg] = 'failed'
      })
  },
})

export const {
  commentReceived,
  commentUpdatedFromSocket,
  commentDeletedFromSocket,
  commentLikeReceived,
  commentLikeRemovedFromSocket,
} = commentsSlice.actions
export default commentsSlice.reducer

export const selectCommentsForPost = (postId) => (state) =>
  state.comments.byPostId[postId]?.items || []
export const selectCommentsStatusForPost = (postId) => (state) =>
  state.comments.statusByPostId[postId] || 'idle'
export const selectCommentsCursorForPost = (postId) => (state) =>
  state.comments.byPostId[postId]?.cursor || null
export const selectCommentsHasMoreForPost = (postId) => (state) =>
  state.comments.byPostId[postId]?.hasMore ?? true
export const selectCommentsCountForPost = (postId) => (state) =>
  state.comments.countByPostId[postId] ?? 0
export const selectCommentsCountStatusForPost = (postId) => (state) =>
  state.comments.countStatusByPostId[postId] || 'idle'
export const selectLikesForComment = (commentId) => (state) =>
  state.comments.likes.filter((like) => like.commentId === commentId)
