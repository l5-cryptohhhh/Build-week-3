import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const TOKEN_STORAGE_KEY = 'social_app_token'

const httpClient = axios.create({
  baseURL: API_URL,
})

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data
    const message =
      (typeof data === 'string' && data) ||
      data?.message ||
      error.message ||
      'Si e verificato un errore imprevisto.'
    return Promise.reject(new Error(message))
  },
)

export function saveToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export default httpClient
