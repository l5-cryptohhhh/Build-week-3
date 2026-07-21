import { io } from 'socket.io-client'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const socket = io(API_URL, {
  autoConnect: false,
  auth: {},
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
})

socket.on('connect_error', (err) => {
  if (err.message === 'unauthorized') {
    window.dispatchEvent(new CustomEvent('auth:expired'))
  }
})

export function connectSocket(token) {
  socket.auth = { token }
  if (!socket.connected) socket.connect()
}

export function disconnectSocket() {
  socket.disconnect()
}

export default socket
