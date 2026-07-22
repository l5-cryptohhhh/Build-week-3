import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as fbLimit,
} from 'firebase/firestore'
import { db } from '../firebase'
import { notifyUser, actorName } from './notificationsService'

const USERS = 'users'
const FOLLOWS = 'follows'

// Estremo superiore standard per un prefix-match "starts with" in Firestore:
// '' e' un carattere Unicode molto alto (area privata), quindi
// `[qLower, qLower + '']` include ogni stringa che inizia per qLower.
const PREFIX_UPPER_BOUND_SUFFIX = ''

function toUser(docSnap) {
  return { id: docSnap.id, ...docSnap.data() }
}

export async function getAllUsers() {
  const snapshot = await getDocs(collection(db, USERS))
  return snapshot.docs.map(toUser)
}

export async function getUserById(id) {
  const snapshot = await getDoc(doc(db, USERS, id))
  if (!snapshot.exists()) throw new Error('Utente non trovato.')
  return toUser(snapshot)
}

export async function updateUser(id, changes) {
  const payload = { ...changes }
  if (changes.username !== undefined) payload.usernameLower = changes.username.toLowerCase()
  if (changes.fullName !== undefined) payload.fullNameLower = changes.fullName.toLowerCase()
  await updateDoc(doc(db, USERS, id), payload)
  const snapshot = await getDoc(doc(db, USERS, id))
  return toUser(snapshot)
}

// Firestore non ha una full-text search integrata (a differenza di `?q=` di
// json-server, che faceva substring-match su tutti i campi): qui si emula
// con un prefix-match su username/nome, che copre il caso d'uso principale
// (digitare l'inizio di un nome) ma non trova match a meta' stringa. Niente
// cursore vero per "carica altri": ogni click rifa' la query con un limite
// piu' alto (va bene per un dataset da demo, non per migliaia di utenti).
export async function searchUsers({ q, page = 1, limit = 10 } = {}) {
  const qLower = (q || '').toLowerCase()
  const upperBound = qLower + PREFIX_UPPER_BOUND_SUFFIX
  const effectiveLimit = limit * page
  const [byUsername, byFullName] = await Promise.all([
    getDocs(
      query(
        collection(db, USERS),
        orderBy('usernameLower'),
        where('usernameLower', '>=', qLower),
        where('usernameLower', '<=', upperBound),
        fbLimit(effectiveLimit),
      ),
    ),
    getDocs(
      query(
        collection(db, USERS),
        orderBy('fullNameLower'),
        where('fullNameLower', '>=', qLower),
        where('fullNameLower', '<=', upperBound),
        fbLimit(effectiveLimit),
      ),
    ),
  ])
  const merged = new Map()
  ;[...byUsername.docs, ...byFullName.docs].forEach((d) => merged.set(d.id, toUser(d)))
  const users = [...merged.values()].slice(0, effectiveLimit)
  const hasMore = byUsername.docs.length === effectiveLimit || byFullName.docs.length === effectiveLimit
  return { users, hasMore }
}

export async function fetchFollowers(userId) {
  const snapshot = await getDocs(query(collection(db, FOLLOWS), where('followingId', '==', userId)))
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function fetchFollowing(userId) {
  const snapshot = await getDocs(query(collection(db, FOLLOWS), where('userId', '==', userId)))
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Id deterministico `followerId_followingId`, stesso motivo dei like in
// postsService: unicita' garantita senza una lettura extra di controllo.
export async function followUser({ followerId, followingId }) {
  const id = `${followerId}_${followingId}`
  const record = { userId: followerId, followingId, createdAt: new Date().toISOString() }
  await setDoc(doc(db, FOLLOWS, id), record)
  await notifyUser({
    userId: followingId,
    actorId: followerId,
    type: 'follow',
    message: `${await actorName(followerId)} ha iniziato a seguirti`,
  })
  return { id, ...record }
}

export async function unfollowUser(followId) {
  await deleteDoc(doc(db, FOLLOWS, followId))
  return followId
}
