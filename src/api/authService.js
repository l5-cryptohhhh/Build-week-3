import httpClient, { saveToken, getToken, clearToken } from './httpClient'
import { decodeJwtPayload } from '../utils/jwt'

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

export function restoreSession() {
  const token = getToken()
  const user = getStoredUser()
  if (token && user) {
    return { token, user }
  }
  return null
}

export function persistUser(user) {
  saveUser(user)
}
