import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as messagesService from '../../api/messagesService'

export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (userId, { rejectWithValue }) => {
    try {
      return await messagesService.fetchConversationsForUser(userId)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const startConversation = createAsyncThunk(
  'messages/startConversation',
  async ({ participant1Id, participant2Id }, { rejectWithValue }) => {
    try {
      return await messagesService.createConversation({ participant1Id, participant2Id })
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

const MESSAGES_LIMIT = 20

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async ({ conversationId, cursor }, { getState, rejectWithValue }) => {
    try {
      const { messages, hasMore, nextCursor } = await messagesService.fetchMessages(conversationId, {
        cursor,
        limit: MESSAGES_LIMIT,
        userId: getState().auth.user.id,
      })
      return { conversationId, messages, hasMore, nextCursor, isFirstPage: !cursor }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ conversationId, userId, content }, { rejectWithValue }) => {
    try {
      return await messagesService.sendMessage({
        conversationId,
        userId,
        content,
        read: false,
        createdAt: new Date().toISOString(),
      })
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const markMessageAsRead = createAsyncThunk(
  'messages/markMessageAsRead',
  async (id, { rejectWithValue }) => {
    try {
      return await messagesService.markMessageRead(id)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const editMessage = createAsyncThunk(
  'messages/editMessage',
  async ({ id, content }, { rejectWithValue }) => {
    try {
      return await messagesService.updateMessage(id, { content })
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const fetchUnreadCounts = createAsyncThunk(
  'messages/fetchUnreadCounts',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const conversations = getState().messages.conversations
      const counts = await Promise.all(
        conversations.map((conversation) => messagesService.fetchUnreadCount(conversation.id, userId)),
      )
      return conversations.reduce((acc, conversation, index) => {
        acc[conversation.id] = counts[index]
        return acc
      }, {})
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const removeMessage = createAsyncThunk(
  'messages/removeMessage',
  async ({ id, conversationId }, { rejectWithValue }) => {
    try {
      await messagesService.deleteMessage(id)
      return { id, conversationId }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

const initialState = {
  conversations: [],
  conversationsStatus: 'idle',
  messagesByConversationId: {},
  messagesCursorByConversationId: {},
  messagesHasMoreByConversationId: {},
  messagesStatus: 'idle',
  unreadCountByConversationId: {},
  error: null,
}

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    messageReceived(state, action) {
      const message = action.payload
      const list = state.messagesByConversationId[message.conversationId]
      if (!list) return
      if (!list.some((item) => item.id === message.id)) {
        list.push(message)
      }
    },
    messageUpdatedFromSocket(state, action) {
      const message = action.payload
      const list = state.messagesByConversationId[message.conversationId]
      if (!list) return
      const index = list.findIndex((item) => item.id === message.id)
      if (index !== -1) list[index] = message
    },
    messageDeletedFromSocket(state, action) {
      const { id, conversationId } = action.payload
      const list = state.messagesByConversationId[conversationId]
      if (!list) return
      if (list.some((item) => item.id === id)) {
        state.messagesByConversationId[conversationId] = list.filter((item) => item.id !== id)
      }
    },
    conversationReceived(state, action) {
      const conversation = action.payload
      if (!state.conversations.some((item) => item.id === conversation.id)) {
        state.conversations.push(conversation)
      }
    },
    unreadCountIncremented(state, action) {
      const conversationId = action.payload
      state.unreadCountByConversationId[conversationId] =
        (state.unreadCountByConversationId[conversationId] || 0) + 1
    },
    conversationMarkedRead(state, action) {
      state.unreadCountByConversationId[action.payload] = 0
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.conversationsStatus = 'loading'
        state.error = null
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversationsStatus = 'succeeded'
        state.conversations = action.payload
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.conversationsStatus = 'failed'
        state.error = action.payload
      })
      .addCase(startConversation.fulfilled, (state, action) => {
        // Dedup by id come conversationReceived: chi crea la conversazione
        // riceve sia l'esito diretto di questo thunk sia l'eco del proprio
        // listener realtime (useConversationsRealtime), che la aggiunge
        // gia' deduplicata - senza questo controllo, se l'eco arriva prima
        // del fulfilled del thunk, la conversazione finisce due volte in
        // `state.conversations` (visto come React key duplicata in
        // ConversationList/MessengerWidget).
        if (!state.conversations.some((item) => item.id === action.payload.id)) {
          state.conversations.push(action.payload)
        }
      })
      .addCase(fetchMessages.pending, (state) => {
        state.messagesStatus = 'loading'
        state.error = null
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, messages, hasMore, nextCursor, isFirstPage } = action.payload
        state.messagesStatus = 'succeeded'
        state.messagesHasMoreByConversationId[conversationId] = hasMore
        state.messagesCursorByConversationId[conversationId] = nextCursor
        const existing = state.messagesByConversationId[conversationId] || []
        state.messagesByConversationId[conversationId] = isFirstPage
          ? messages
          : [...messages, ...existing]
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesStatus = 'failed'
        state.error = action.payload
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { conversationId } = action.payload
        const list = state.messagesByConversationId[conversationId] || []
        if (!list.some((message) => message.id === action.payload.id)) {
          state.messagesByConversationId[conversationId] = [...list, action.payload]
        }
      })
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        const list = state.messagesByConversationId[action.payload.conversationId]
        if (list) {
          const index = list.findIndex((message) => message.id === action.payload.id)
          if (index !== -1) list[index] = action.payload
        }
      })
      .addCase(editMessage.fulfilled, (state, action) => {
        const list = state.messagesByConversationId[action.payload.conversationId]
        if (list) {
          const index = list.findIndex((message) => message.id === action.payload.id)
          if (index !== -1) list[index] = action.payload
        }
      })
      .addCase(fetchUnreadCounts.fulfilled, (state, action) => {
        state.unreadCountByConversationId = { ...state.unreadCountByConversationId, ...action.payload }
      })
      .addCase(removeMessage.fulfilled, (state, action) => {
        const { id, conversationId } = action.payload
        const list = state.messagesByConversationId[conversationId]
        if (list && list.some((message) => message.id === id)) {
          state.messagesByConversationId[conversationId] = list.filter(
            (message) => message.id !== id,
          )
        }
      })
  },
})

export const {
  messageReceived,
  messageUpdatedFromSocket,
  messageDeletedFromSocket,
  conversationReceived,
  unreadCountIncremented,
  conversationMarkedRead,
} = messagesSlice.actions
export default messagesSlice.reducer

export const selectConversations = (state) => state.messages.conversations
export const selectConversationsStatus = (state) => state.messages.conversationsStatus
export const selectMessagesForConversation = (conversationId) => (state) =>
  state.messages.messagesByConversationId[conversationId] || []
export const selectMessagesStatus = (state) => state.messages.messagesStatus
export const selectMessagesCursorForConversation = (conversationId) => (state) =>
  state.messages.messagesCursorByConversationId[conversationId] || null
export const selectMessagesHasMoreForConversation = (conversationId) => (state) =>
  state.messages.messagesHasMoreByConversationId[conversationId] ?? true
export const selectUnreadCountForConversation = (conversationId) => (state) =>
  state.messages.unreadCountByConversationId[conversationId] || 0
export const selectTotalUnreadMessages = (state) =>
  Object.values(state.messages.unreadCountByConversationId).reduce((sum, count) => sum + count, 0)
