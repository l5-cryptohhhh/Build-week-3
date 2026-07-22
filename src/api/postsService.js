import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as fbLimit,
  setDoc,
  documentId,
} from 'firebase/firestore'
import { db } from '../firebase'
import { notifyUser, actorName } from './notificationsService'

const POSTS = 'posts'
const LIKES = 'likes'

function toPost(docSnap) {
  return { id: docSnap.id, ...docSnap.data() }
}

// Firestore 'in' accetta al massimo 10 valori per query: le chiamate che
// filtrano per piu' id (post salvati, like di piu' post) suddividono
// l'elenco in gruppi da 10 e uniscono i risultati.
function chunk(array, size) {
  const chunks = []
  for (let i = 0; i < array.length; i += size) chunks.push(array.slice(i, i + size))
  return chunks
}

// Pagina 1 = nessun cursore. Le pagine successive passano `cursor` = il
// createdAt dell'ultimo post gia' caricato (stringa ISO, ordinabile
// lessicograficamente come le date) invece di un numero di pagina: Firestore
// pagina con `where(campo, '<', valore)` sullo stesso campo dell'orderBy,
// non con un offset - e a differenza di un cursore-snapshot, un valore
// primitivo resta serializzabile nello stato Redux.
export async function fetchPosts({ cursor, limit = 5, userIds } = {}) {
  if (userIds && userIds.length === 0) {
    return { posts: [], hasMore: false, nextCursor: null }
  }
  const constraints = [orderBy('createdAt', 'desc')]
  // Il feed "Chi segui" di chi ne segue piu' di 10 mostra solo i post dei
  // primi 10 seguiti: limite noto del filtro 'in' di Firestore, json-server
  // non aveva questo vincolo sull'OR filter equivalente.
  if (userIds) constraints.push(where('userId', 'in', userIds.slice(0, 10)))
  if (cursor) constraints.push(where('createdAt', '<', cursor))
  constraints.push(fbLimit(limit))

  const snapshot = await getDocs(query(collection(db, POSTS), ...constraints))
  const posts = snapshot.docs.map(toPost)
  return {
    posts,
    hasMore: posts.length === limit,
    nextCursor: posts.length ? posts[posts.length - 1].createdAt : null,
  }
}

export async function fetchPostsByUser(userId) {
  const snapshot = await getDocs(
    query(collection(db, POSTS), where('userId', '==', userId), orderBy('createdAt', 'desc')),
  )
  return snapshot.docs.map(toPost)
}

export async function fetchPostById(id) {
  const snapshot = await getDoc(doc(db, POSTS, id))
  if (!snapshot.exists()) throw new Error('Post non trovato.')
  return toPost(snapshot)
}

export async function createPost(post) {
  const now = new Date().toISOString()
  const payload = {
    ...post,
    contentLower: (post.content || '').toLowerCase(),
    createdAt: now,
    updatedAt: now,
  }
  const ref = await addDoc(collection(db, POSTS), payload)
  return { id: ref.id, ...payload }
}

export async function updatePost(id, changes) {
  const payload = { ...changes, updatedAt: new Date().toISOString() }
  if (changes.content !== undefined) payload.contentLower = changes.content.toLowerCase()
  await updateDoc(doc(db, POSTS, id), payload)
  const snapshot = await getDoc(doc(db, POSTS, id))
  return toPost(snapshot)
}

export async function deletePost(id) {
  await deleteDoc(doc(db, POSTS, id))
  return id
}

export async function fetchPostsByIds(ids) {
  if (!ids.length) return []
  const results = await Promise.all(
    chunk(ids, 10).map((group) =>
      getDocs(query(collection(db, POSTS), where(documentId(), 'in', group))),
    ),
  )
  return results.flatMap((snapshot) => snapshot.docs.map(toPost))
}

// Ricerca testuale sui post: come per usersService.searchUsers, Firestore
// non ha `?q=` (substring-match) come json-server, quindi si emula con un
// prefix-match su `contentLower`. Un filtro range su un campo impone che
// l'orderBy sia sullo stesso campo, quindi qui i risultati sono ordinati
// alfabeticamente sul contenuto, non per data come nel feed principale -
// limite noto, accettabile per una ricerca testuale. Stessa strategia
// "rifai la query con un limite piu' alto" usata per la ricerca utenti al
// posto di un vero cursore, dato che i due prefissi non sono comparabili.
export async function searchPostsByContent({ q, page = 1, limit = 5 } = {}) {
  const qLower = (q || '').toLowerCase()
  const effectiveLimit = limit * page
  const snapshot = await getDocs(
    query(
      collection(db, POSTS),
      orderBy('contentLower'),
      where('contentLower', '>=', qLower),
      where('contentLower', '<=', qLower + ''),
      fbLimit(effectiveLimit),
    ),
  )
  const posts = snapshot.docs.map(toPost)
  return { posts, hasMore: posts.length === effectiveLimit }
}

export async function fetchLikesForPosts(postIds) {
  if (!postIds.length) return []
  const results = await Promise.all(
    chunk(postIds, 10).map((group) =>
      getDocs(query(collection(db, LIKES), where('postId', 'in', group))),
    ),
  )
  return results.flatMap((snapshot) => snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
}

// Id deterministico `postId_userId`: un like e' univoco per coppia
// post/utente, evita letture extra per controllare l'esistenza prima di
// scrivere (a differenza dell'id auto-incrementale di json-server).
export async function likePost({ postId, userId }) {
  const id = `${postId}_${userId}`
  const like = { postId, userId, createdAt: new Date().toISOString() }
  await setDoc(doc(db, LIKES, id), like)

  const postSnapshot = await getDoc(doc(db, POSTS, postId))
  if (postSnapshot.exists()) {
    const post = postSnapshot.data()
    await notifyUser({
      userId: post.userId,
      actorId: userId,
      type: 'like',
      message: `${await actorName(userId)} ha messo mi piace al tuo post`,
      postId,
    })
  }

  return { id, ...like }
}

export async function unlikePost(likeId) {
  await deleteDoc(doc(db, LIKES, likeId))
  return likeId
}
