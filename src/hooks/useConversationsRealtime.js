import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import {
  messageReceived,
  messageUpdatedFromSocket,
  messageDeletedFromSocket,
  conversationReceived,
  unreadCountIncremented,
} from '../features/messages/messagesSlice'
import { selectCurrentUser } from '../features/auth/authSlice'

// Sostituisce useConversationSocket (prima: socket.io, stanza `user:{id}`
// lato server). Due listener Firestore, entrambi filtrati su
// `participantIds` (array-contains) cosi' le Security Rules su `messages`
// possono verificarli senza un get() alla conversazione - vedi
// firestore.rules e messagesService.sendMessage. Montato una sola volta per
// l'intera sessione (in App.jsx), come prima: il badge dei non letti in
// navbar resta aggiornato ovunque ci si trovi.
export default function useConversationsRealtime() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)

  useEffect(() => {
    if (!currentUser) return undefined

    const unsubscribeConversations = onSnapshot(
      query(collection(db, 'conversations'), where('participantIds', 'array-contains', currentUser.id)),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            dispatch(conversationReceived({ id: change.doc.id, ...change.doc.data() }))
          }
        })
      },
    )

    const unsubscribeMessages = onSnapshot(
      query(collection(db, 'messages'), where('participantIds', 'array-contains', currentUser.id)),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const message = { id: change.doc.id, ...change.doc.data() }
          if (change.type === 'added') {
            dispatch(messageReceived(message))
            if (message.userId !== currentUser.id) {
              dispatch(unreadCountIncremented(message.conversationId))
            }
          }
          if (change.type === 'modified') dispatch(messageUpdatedFromSocket(message))
          if (change.type === 'removed') {
            dispatch(messageDeletedFromSocket({ id: message.id, conversationId: message.conversationId }))
          }
        })
      },
    )

    return () => {
      unsubscribeConversations()
      unsubscribeMessages()
    }
  }, [dispatch, currentUser?.id])
}
