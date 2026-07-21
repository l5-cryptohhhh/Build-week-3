import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  onlineUserIds: [],
}

const presenceSlice = createSlice({
  name: 'presence',
  initialState,
  reducers: {
    presenceListReceived(state, action) {
      state.onlineUserIds = action.payload
    },
    userWentOnline(state, action) {
      if (!state.onlineUserIds.includes(action.payload)) state.onlineUserIds.push(action.payload)
    },
    userWentOffline(state, action) {
      state.onlineUserIds = state.onlineUserIds.filter((id) => id !== action.payload)
    },
  },
})

export const { presenceListReceived, userWentOnline, userWentOffline } = presenceSlice.actions
export default presenceSlice.reducer

export const selectIsUserOnline = (userId) => (state) => state.presence.onlineUserIds.includes(userId)
