import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as usersService from '../../api/usersService'

export const fetchFollowData = createAsyncThunk(
  'follow/fetchFollowData',
  async (userId, { rejectWithValue }) => {
    try {
      const [followers, following] = await Promise.all([
        usersService.fetchFollowers(userId),
        usersService.fetchFollowing(userId),
      ])
      return { followers, following }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const toggleFollow = createAsyncThunk(
  'follow/toggleFollow',
  async ({ followerId, followingId }, { getState, rejectWithValue }) => {
    try {
      const existing = getState().follow.items.find(
        (record) => record.userId === followerId && record.followingId === followingId,
      )
      if (existing) {
        await usersService.unfollowUser(existing.id)
        return { following: false, followId: existing.id }
      }
      const record = await usersService.followUser({ followerId, followingId })
      return { following: true, record }
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

function mergeRecords(state, records) {
  const existingIds = new Set(state.items.map((record) => record.id))
  records.forEach((record) => {
    if (!existingIds.has(record.id)) state.items.push(record)
  })
}

const followSlice = createSlice({
  name: 'follow',
  initialState,
  reducers: {
    followReceived(state, action) {
      if (state.items.some((record) => record.id === action.payload.id)) return
      state.items.push(action.payload)
    },
    followRemovedFromSocket(state, action) {
      state.items = state.items.filter((record) => record.id !== action.payload.id)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFollowData.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchFollowData.fulfilled, (state, action) => {
        state.status = 'succeeded'
        mergeRecords(state, action.payload.followers)
        mergeRecords(state, action.payload.following)
      })
      .addCase(fetchFollowData.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(toggleFollow.fulfilled, (state, action) => {
        if (action.payload.following) {
          // Dedup by id: il listener realtime (followReceived) puo'
          // ricevere l'eco della scrittura locale prima ancora che questo
          // thunk si risolva, altrimenti il follower risulterebbe doppio.
          const record = action.payload.record
          if (!state.items.some((item) => item.id === record.id)) {
            state.items.push(record)
          }
        } else {
          state.items = state.items.filter((record) => record.id !== action.payload.followId)
        }
      })
  },
})

export const { followReceived, followRemovedFromSocket } = followSlice.actions
export default followSlice.reducer

export const selectFollowersCount = (userId) => (state) =>
  state.follow.items.filter((record) => record.followingId === userId).length
export const selectFollowingCount = (userId) => (state) =>
  state.follow.items.filter((record) => record.userId === userId).length
export const selectIsFollowing = (followerId, followingId) => (state) =>
  state.follow.items.some(
    (record) => record.userId === followerId && record.followingId === followingId,
  )
export const selectFollowingIds = (userId) => (state) =>
  state.follow.items.filter((record) => record.userId === userId).map((record) => record.followingId)
export const selectFollowerIds = (userId) => (state) =>
  state.follow.items.filter((record) => record.followingId === userId).map((record) => record.userId)
// Collegamenti reciproci: persone che l'utente segue e che a loro volta lo seguono.
export const selectMutualIds = (userId) => (state) => {
  const followerIdSet = new Set(
    state.follow.items.filter((record) => record.followingId === userId).map((record) => record.userId),
  )
  return state.follow.items
    .filter((record) => record.userId === userId && followerIdSet.has(record.followingId))
    .map((record) => record.followingId)
}
