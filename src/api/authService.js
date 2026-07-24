import httpClient, { saveToken, getToken, clearToken } from './httpClient'
import { decodeJwtPayload, isTokenExpired } from '../utils/jwt'

const USER_STORAGE_KEY = 'social_app_user'

function saveUser(user) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

function getStoredUser() {
  const raw = localStorage.getItem(USER_STORAGE_KEY)
  return raw ? JSON.parse(raw) : null
}

function clearUser() {
  localStorage.removeItem(USER_STORAGE_KEY)
}

// json-server-auth returns { accessToken, user } on /login, but /register
// only guarantees { accessToken }: resolve the user record from the JWT if missing.
async function resolveUser(data) {
  if (data.user) return data.user
  const { sub } = decodeJwtPayload(data.accessToken)
  const { data: user } = await httpClient.get(`/users/${sub}`)
  return user
}

export async function register({ email, password, username, fullName, jobTitle = '' }) {
  const { data } = await httpClient.post('/register', {
    email,
    password,
    username,
    fullName,
    jobTitle,
    avatarUrl: '',
    bio: '',
    createdAt: new Date().toISOString(),
  })
  saveToken(data.accessToken)
  const user = await resolveUser(data)
  saveUser(user)
  return { user, accessToken: data.accessToken }
}

export async function login({ email, password }) {
  const { data } = await httpClient.post('/login', { email, password })
  saveToken(data.accessToken)
  const user = await resolveUser(data)
  saveUser(user)
  return { user, accessToken: data.accessToken }
}

export function logout() {
  clearToken()
  clearUser()
}

// Non ci si fida ciecamente dello snapshot utente salvato in localStorage:
// se il backend mock viene resettato/reseedato (vedi CHECKPOINT.md), lo
// stesso id puo' finire per appartenere a un account diverso, e una sessione
// cache scaduta mostrerebbe silenziosamente il profilo di qualcun altro. Si
// riverifica quindi l'id contro il server e si confronta l'email presente
// nel token con quella dell'utente restituito, esattamente come fa
// resolveUser() al login.
export async function restoreSession() {
  const token = getToken()
  if (!token || isTokenExpired(token)) {
    logout()
    return null
  }

  const cachedUser = getStoredUser()

  try {
    const { sub, email } = decodeJwtPayload(token)
    const { data: freshUser } = await httpClient.get(`/users/${sub}`)
    if (freshUser.email !== email) {
      // L'id nel token ora appartiene a un account diverso: la sessione non e' piu' valida.
      logout()
      return null
    }
    saveUser(freshUser)
    return { token, user: freshUser }
  } catch {
    // Server irraggiungibile: meglio riusare la cache che disconnettere per un blip di rete.
    if (cachedUser) return { token, user: cachedUser }
    return null
  }
}

export function persistUser(user) {
  saveUser(user)
}
