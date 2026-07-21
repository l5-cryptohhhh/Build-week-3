import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import socket from '../socket'
import {
  messageReceived,
  messageUpdatedFromSocket,
  messageDeletedFromSocket,
  conversationReceived,
  unreadCountIncremented,
} from '../features/messages/messagesSlice'
import { selectCurrentUser } from '../features/auth/authSlice'

// Sottoscrive gli eventi realtime della messaggistica (vedi server/realtime.js)
// sul socket condiviso e li traduce in azioni Redux. Montato una sola volta
// per l'intera sessione (in App.jsx, non nella sola pagina messaggi) cosi'
// il badge dei non letti in navbar resta aggiornato ovunque ci si trovi.
export default function useConversationSocket() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)

  useEffect(() => {
    function handleNewMessage(message) {
      dispatch(messageReceived(message))
      if (message.userId !== currentUser?.id) {
        dispatch(unreadCountIncremented(message.conversationId))
      }
    }
    function handleUpdatedMessage(message) {
      dispatch(messageUpdatedFromSocket(message))
    }
    function handleDeletedMessage(payload) {
      dispatch(messageDeletedFromSocket(payload))
    }
    function handleNewConversation(conversation) {
      dispatch(conversationReceived(conversation))
    }

    socket.on('message:new', handleNewMessage)
    socket.on('message:updated', handleUpdatedMessage)
    socket.on('message:deleted', handleDeletedMessage)
    socket.on('conversation:new', handleNewConversation)

    return () => {
      socket.off('message:new', handleNewMessage)
      socket.off('message:updated', handleUpdatedMessage)
      socket.off('message:deleted', handleDeletedMessage)
      socket.off('conversation:new', handleNewConversation)
    }
  }, [dispatch, currentUser?.id])
}
