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

const initialState = {
  user: null,
  status: 'idle',
  error: null,
  initialized: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionCleared(state) {
      state.user = null
      state.status = 'idle'
      state.error = null
    },
    // Dispatched dal listener onAuthStateChanged montato in App.jsx (vedi
    // authService.subscribeToAuthChanges): sostituisce il vecchio thunk
    // restoreSession basato su JWT in localStorage. `initialized` diventa
    // true al primo evento, sia che l'utente risulti loggato o meno.
    authStateChanged(state, action) {
      state.initialized = true
      state.user = action.payload
      state.status = action.payload ? 'succeeded' : 'idle'
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
        state.user = action.payload
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
        state.user = action.payload
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Credenziali non valide.'
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.user && state.user.id === action.payload.id) {
          state.user = action.payload
        }
      })
  },
})

export const { sessionCleared, authStateChanged } = authSlice.actions
export default authSlice.reducer

// Thunk invece di un semplice action creator: `authService.logout()` e' un
// side effect (signOut di Firebase Auth), non appartiene al body di un
// reducer che deve restare puro. `sessionCleared` resta comunque ridondante
// con l'evento che onAuthStateChanged emettera' a sua volta (authStateChanged
// con payload null) ma aggiorna lo stato subito, senza aspettare il round-trip.
export function logout() {
  return async (dispatch) => {
    await authService.logout()
    dispatch(sessionCleared())
  }
}

export const selectCurrentUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => Boolean(state.auth.user)
export const selectAuthStatus = (state) => state.auth.status
export const selectAuthError = (state) => state.auth.error
export const selectAuthInitialized = (state) => state.auth.initialized
