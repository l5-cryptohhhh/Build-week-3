import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import socket from '../socket'
import {
  postReceived,
  postUpdatedFromSocket,
  postDeletedFromSocket,
  likeReceived,
  likeRemovedFromSocket,
} from '../features/posts/postsSlice'
import {
  commentReceived,
  commentUpdatedFromSocket,
  commentDeletedFromSocket,
} from '../features/comments/commentsSlice'
import { followReceived, followRemovedFromSocket } from '../features/follow/followSlice'
import { notificationReceived } from '../features/notifications/notificationsSlice'

// Sottoscrive gli eventi realtime di post/like/commenti/follow/notifiche
// (vedi server/realtime.js) sul socket condiviso, cosi' le azioni di un
// utente compaiono subito per tutti gli altri collegati senza refetch.
// Montato una sola volta per l'intera sessione (in App.jsx), come
// useConversationSocket.
export default function useActivitySocket() {
  const dispatch = useDispatch()

  useEffect(() => {
    const handlers = {
      'post:new': postReceived,
      'post:updated': postUpdatedFromSocket,
      'post:deleted': postDeletedFromSocket,
      'like:new': likeReceived,
      'like:deleted': likeRemovedFromSocket,
      'comment:new': commentReceived,
      'comment:updated': commentUpdatedFromSocket,
      'comment:deleted': commentDeletedFromSocket,
      'follow:new': followReceived,
      'follow:deleted': followRemovedFromSocket,
      'notification:new': notificationReceived,
    }

    Object.entries(handlers).forEach(([event, actionCreator]) => {
      socket.on(event, (payload) => dispatch(actionCreator(payload)))
    })

    return () => {
      Object.keys(handlers).forEach((event) => socket.off(event))
    }
  }, [dispatch])
}
