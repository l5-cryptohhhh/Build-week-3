import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { notificationReceived } from '../features/notifications/notificationsSlice'
import { selectCurrentUser } from '../features/auth/authSlice'

// Sostituisce la parte 'notification:new' di useActivitySocket: le
// notifiche sono per loro natura private (solo il destinatario puo'
// leggerle, vedi firestore.rules), quindi qui serve un listener filtrato
// per utente invece che uno globale come per post/commenti/like/follow.
export default function useNotificationsRealtime() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)

  useEffect(() => {
    if (!currentUser) return undefined

    const unsubscribe = onSnapshot(
      query(
        collection(db, 'notifications'),
        where('userId', '==', currentUser.id),
        orderBy('createdAt', 'desc'),
      ),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            dispatch(notificationReceived({ id: change.doc.id, ...change.doc.data() }))
          }
        })
      },
    )

    return unsubscribe
  }, [dispatch, currentUser?.id])
}
