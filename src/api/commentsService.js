import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  getCountFromServer,
  query,
  where,
  orderBy,
  limit as fbLimit,
} from 'firebase/firestore'
import { db } from '../firebase'
import { notifyUser, actorName } from './notificationsService'

const COMMENTS = 'comments'
const POSTS = 'posts'

function toComment(docSnap) {
  return { id: docSnap.id, ...docSnap.data() }
}

// Il conteggio commenti va mostrato sotto ogni post anche prima di aprirne
// la lista (come i like), ma la paginazione a cursore non da' un totale
// reale se sono gia' caricati meno commenti del totale. `getCountFromServer`
// e' un'aggregazione lato server (1 sola lettura "count", non un documento
// per ogni commento): equivalente all'header X-Total-Count di json-server,
// senza scaricare i commenti stessi.
export async function countCommentsForPost(postId) {
  const snapshot = await getCountFromServer(query(collection(db, COMMENTS), where('postId', '==', postId)))
  return snapshot.data().count
}

// Pagina 1 = nessun cursore, pagine successive passano `cursor` = createdAt
// dell'ultimo commento gia' caricato (vedi stesso pattern in postsService).
// A differenza dei post (piu' recenti prima), i commenti vanno letti in
// ordine cronologico crescente, quindi il cursore filtra con '>'.
export async function fetchCommentsByPost(postId, { cursor, limit = 10 } = {}) {
  const constraints = [where('postId', '==', postId), orderBy('createdAt', 'asc')]
  if (cursor) constraints.push(where('createdAt', '>', cursor))
  constraints.push(fbLimit(limit))

  const snapshot = await getDocs(query(collection(db, COMMENTS), ...constraints))
  const comments = snapshot.docs.map(toComment)
  return {
    comments,
    hasMore: comments.length === limit,
    nextCursor: comments.length ? comments[comments.length - 1].createdAt : null,
  }
}

export async function createComment(comment) {
  const payload = { ...comment, createdAt: new Date().toISOString() }
  const ref = await addDoc(collection(db, COMMENTS), payload)
  const created = { id: ref.id, ...payload }

  const postSnapshot = await getDoc(doc(db, POSTS, comment.postId))
  if (postSnapshot.exists()) {
    const post = postSnapshot.data()
    await notifyUser({
      userId: post.userId,
      actorId: comment.userId,
      type: 'comment',
      message: `${await actorName(comment.userId)} ha commentato il tuo post`,
      postId: comment.postId,
    })
  }

  return created
}

export async function updateComment(id, changes) {
  await updateDoc(doc(db, COMMENTS, id), changes)
  const snapshot = await getDoc(doc(db, COMMENTS, id))
  return toComment(snapshot)
}

export async function deleteComment(id) {
  await deleteDoc(doc(db, COMMENTS, id))
  return id
}
