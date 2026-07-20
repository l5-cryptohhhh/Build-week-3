import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as usersService from '../../api/usersService'

export const fetchAllUsers = createAsyncThunk(
  'users/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      return await usersService.getAllUsers()
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (id, { rejectWithValue }) => {
    try {
      return await usersService.getUserById(id)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const updateProfile = createAsyncThunk(
  'users/updateProfile',
  async ({ id, changes }, { rejectWithValue }) => {
    try {
      return await usersService.updateUser(id, changes)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

const initialState = {
  byId: {},
  status: 'idle',
  error: null,
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.status = 'succeeded'
        action.payload.forEach((user) => {
          state.byId[user.id] = user
        })
      })
      .addCase(fetchUserById.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.byId[action.payload.id] = action.payload
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Utente non trovato.'
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.byId[action.payload.id] = action.payload
      })
  },
})

export default usersSlice.reducer

export const selectUserById = (id) => (state) => state.users.byId[id]
export const selectUsersStatus = (state) => state.users.status
export const selectUsersError = (state) => state.users.error
