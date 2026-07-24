import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { presenceListReceived } from '../features/presence/presenceSlice'
import { selectCurrentUser } from '../features/auth/authSlice'

const HEARTBEAT_MS = 25000
const ONLINE_THRESHOLD_MS = 45000

// Sostituisce usePresenceSocket (prima: contatore di connessioni lato
// server, con evento "offline" solo alla disconnessione dell'ultima tab).
// Firestore non ha un equivalente di `onDisconnect` di Realtime Database
// (richiederebbe un secondo database solo per la presenza, fuori scope):
// ogni client aggiorna periodicamente `presence/{uid}.lastActiveAt`, e
// "online" e' definito come "aggiornato negli ultimi 45s", ricalcolato lato
// client ogni 15s oltre che ad ogni cambiamento della collection. Limite
// noto rispetto a onDisconnect: una chiusura brusca (crash, rete che cade)
// lascia l'utente "online" fino al timeout, non e' istantaneo.
export default function usePresence() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)

  useEffect(() => {
    if (!currentUser) return undefined

    const presenceDocRef = doc(db, 'presence', currentUser.id)
    const heartbeat = () => setDoc(presenceDocRef, { lastActiveAt: new Date().toISOString() })
    heartbeat()
    const heartbeatId = setInterval(heartbeat, HEARTBEAT_MS)

    const lastActiveById = {}
    function recomputeOnline() {
      const now = Date.now()
      const onlineIds = Object.entries(lastActiveById)
        .filter(([, lastActiveAt]) => now - new Date(lastActiveAt).getTime() < ONLINE_THRESHOLD_MS)
        .map(([id]) => id)
      dispatch(presenceListReceived(onlineIds))
    }

    const unsubscribe = onSnapshot(collection(db, 'presence'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'removed') {
          delete lastActiveById[change.doc.id]
        } else {
          lastActiveById[change.doc.id] = change.doc.data().lastActiveAt
        }
      })
      recomputeOnline()
    })

    const recomputeId = setInterval(recomputeOnline, 15000)

    return () => {
      clearInterval(heartbeatId)
      clearInterval(recomputeId)
      unsubscribe()
    }
  }, [dispatch, currentUser?.id])
}
