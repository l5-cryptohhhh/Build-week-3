import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'

async function actorName(actorId) {
  const snapshot = await getDoc(doc(db, 'users', actorId))
  return snapshot.exists() ? snapshot.data().fullName || 'Qualcuno' : 'Qualcuno'
}

// Creata dal client che compie l'azione (like/commento/follow/messaggio),
// non da un backend: non ci sono Cloud Functions in questo progetto (piano
// Firebase gratuito). firestore.rules impedisce a chiunque di creare una
// notifica per se stesso o spacciandosi per un altro `actorId`.
async function notifyUser({ userId, actorId, type, message, postId, conversationId }) {
  if (userId === actorId) return
  const notification = {
    userId,
    actorId,
    type,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  }
  if (postId !== undefined) notification.postId = postId
  if (conversationId !== undefined) notification.conversationId = conversationId
  await addDoc(collection(db, 'notifications'), notification)
}

export async function fetchNotificationsForUser(userId) {
  const snapshot = await getDocs(
    query(collection(db, 'notifications'), where('userId', '==', userId), orderBy('createdAt', 'desc')),
  )
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function markNotificationRead(id) {
  await updateDoc(doc(db, 'notifications', id), { read: true })
  const snapshot = await getDoc(doc(db, 'notifications', id))
  return { id: snapshot.id, ...snapshot.data() }
}

// Un batch invece di N updateDoc separate: stesso numero di scritture verso
// Firestore, ma un'unica richiesta di rete e un'unica conferma invece di N
// round-trip in parallelo. Ogni scrittura nel batch tocca comunque solo il
// campo `read`, quindi resta valida per la regola di sicurezza che lo
// impone (`affectedKeys().hasOnly(['read'])`).
export async function markAllNotificationsRead(userId) {
  const snapshot = await getDocs(
    query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false),
    ),
  )
  if (snapshot.empty) return
  const batch = writeBatch(db)
  snapshot.docs.forEach((d) => batch.update(d.ref, { read: true }))
  await batch.commit()
}

export { notifyUser, actorName }
