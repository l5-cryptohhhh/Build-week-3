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

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      const messages = await messagesService.fetchMessages(conversationId)
      return { conversationId, messages }
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
  messagesStatus: 'idle',
  error: null,
}

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {},
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
        state.conversations.push(action.payload)
      })
      .addCase(fetchMessages.pending, (state) => {
        state.messagesStatus = 'loading'
        state.error = null
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesStatus = 'succeeded'
        state.messagesByConversationId[action.payload.conversationId] = action.payload.messages
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesStatus = 'failed'
        state.error = action.payload
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const list = state.messagesByConversationId[action.payload.conversationId] || []
        state.messagesByConversationId[action.payload.conversationId] = [...list, action.payload]
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
      .addCase(removeMessage.fulfilled, (state, action) => {
        const list = state.messagesByConversationId[action.payload.conversationId]
        if (list) {
          state.messagesByConversationId[action.payload.conversationId] = list.filter(
            (message) => message.id !== action.payload.id,
          )
        }
      })
  },
})

export default messagesSlice.reducer

export const selectConversations = (state) => state.messages.conversations
export const selectConversationsStatus = (state) => state.messages.conversationsStatus
export const selectMessagesForConversation = (conversationId) => (state) =>
  state.messages.messagesByConversationId[conversationId] || []
export const selectMessagesStatus = (state) => state.messages.messagesStatus
