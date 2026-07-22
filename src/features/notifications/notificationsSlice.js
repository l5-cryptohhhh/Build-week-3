import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as notificationsService from '../../api/notificationsService'

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (userId, { rejectWithValue }) => {
    try {
      return await notificationsService.fetchNotificationsForUser(userId)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const markNotificationRead = createAsyncThunk(
  'notifications/markNotificationRead',
  async (id, { rejectWithValue }) => {
    try {
      return await notificationsService.markNotificationRead(id)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllNotificationsRead',
  async (userId, { rejectWithValue }) => {
    try {
      await notificationsService.markAllNotificationsRead(userId)
      return userId
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

const initialState = {
  items: [],
  status: 'idle',
  error: null,
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    notificationReceived(state, action) {
      const exists = state.items.some((item) => item.id === action.payload.id)
      if (!exists) state.items.unshift(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach((item) => {
          item.read = true
        })
      })
  },
})

export const { notificationReceived } = notificationsSlice.actions
export default notificationsSlice.reducer

export const selectNotifications = (state) => state.notifications.items
export const selectNotificationsStatus = (state) => state.notifications.status
export const selectUnreadNotificationsCount = (state) =>
  state.notifications.items.filter((item) => !item.read).length
