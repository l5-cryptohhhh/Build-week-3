import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import socket from '../socket'
import {
  presenceListReceived,
  userWentOnline,
  userWentOffline,
} from '../features/presence/presenceSlice'

// Attivo per l'intera durata della sessione (montato in App.jsx), non solo
// nella pagina messaggi: il pallino "online" compare anche in profilo,
// elenco conversazioni e risultati di ricerca.
export default function usePresenceSocket() {
  const dispatch = useDispatch()

  useEffect(() => {
    function handleList(userIds) {
      dispatch(presenceListReceived(userIds))
    }
    function handleOnline(userId) {
      dispatch(userWentOnline(userId))
    }
    function handleOffline(userId) {
      dispatch(userWentOffline(userId))
    }

    socket.on('presence:list', handleList)
    socket.on('presence:online', handleOnline)
    socket.on('presence:offline', handleOffline)

    return () => {
      socket.off('presence:list', handleList)
      socket.off('presence:online', handleOnline)
      socket.off('presence:offline', handleOffline)
    }
  }, [dispatch])
}
