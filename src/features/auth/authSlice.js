import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as authService from '../../api/authService'
import { updateProfile } from '../users/usersSlice'

export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      return await authService.register(formData)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

export const restoreSession = createAsyncThunk('auth/restore', async () => {
  return authService.restoreSession()
})

const initialState = {
  user: null,
  token: null,
  status: 'idle',
  error: null,
  initialized: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      authService.logout()
      state.user = null
      state.token = null
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.accessToken
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Registrazione fallita.'
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.accessToken
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Credenziali non valide.'
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.initialized = true
        if (action.payload) {
          state.user = action.payload.user
          state.token = action.payload.token
          state.status = 'succeeded'
        }
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.user && state.user.id === action.payload.id) {
          state.user = action.payload
          authService.persistUser(action.payload)
        }
      })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer

export const selectCurrentUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => Boolean(state.auth.token)
export const selectAuthStatus = (state) => state.auth.status
export const selectAuthError = (state) => state.auth.error
export const selectAuthInitialized = (state) => state.auth.initialized
