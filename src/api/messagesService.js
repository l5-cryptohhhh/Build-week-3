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
} from 'firebase/firestore'
import { db } from '../firebase'
import { notifyUser, actorName } from './notificationsService'

const CONVERSATIONS = 'conversations'
const MESSAGES = 'messages'

function toDoc(docSnap) {
  return { id: docSnap.id, ...docSnap.data() }
}

export async function fetchConversationsForUser(userId) {
  // `participantIds` (array dei due id) e' un campo derivato, mantenuto solo
  // per poter usare `array-contains` in una singola query invece delle due
  // query separate per participant1Id/participant2Id di prima.
  const snapshot = await getDocs(
    query(collection(db, CONVERSATIONS), where('participantIds', 'array-contains', userId)),
  )
  return snapshot.docs.map(toDoc)
}

export async function createConversation({ participant1Id, participant2Id }) {
  const payload = {
    participant1Id,
    participant2Id,
    participantIds: [participant1Id, participant2Id],
    createdAt: new Date().toISOString(),
  }
  const ref = await addDoc(collection(db, CONVERSATIONS), payload)
  return { id: ref.id, ...payload }
}

// Pagina 1 = nessun cursore, restituisce gli ultimi `limit` messaggi (ordine
// desc lato query, invertito qui per l'ordine cronologico atteso dalla UI -
// stesso comportamento di prima). Le pagine successive ("carica precedenti")
// passano `cursor` = createdAt del messaggio piu' vecchio gia' caricato.
// Il filtro su `participantIds` e' obbligatorio (non solo `conversationId`):
// la regola di sicurezza su messages controlla quel campo, e Firestore nega
// in blocco una query "list" se il filtro non lo include esplicitamente -
// stesso principio del fix a firestore.rules per conversations.
export async function fetchMessages(conversationId, { cursor, limit = 20, userId } = {}) {
  const constraints = [
    where('conversationId', '==', conversationId),
    where('participantIds', 'array-contains', userId),
    orderBy('createdAt', 'desc'),
  ]
  if (cursor) constraints.push(where('createdAt', '<', cursor))
  constraints.push(fbLimit(limit))

  const snapshot = await getDocs(query(collection(db, MESSAGES), ...constraints))
  const messages = snapshot.docs.map(toDoc).reverse()
  return {
    messages,
    hasMore: messages.length === limit,
    nextCursor: messages.length ? messages[0].createdAt : null,
  }
}

export async function sendMessage(message) {
  const conversationSnapshot = await getDoc(doc(db, CONVERSATIONS, message.conversationId))
  if (!conversationSnapshot.exists()) {
    throw new Error('Conversazione non trovata.')
  }
  const conversation = conversationSnapshot.data()

  // `participantIds` copiato dalla conversazione: le regole di sicurezza e
  // il listener realtime globale sui messaggi (useConversationsRealtime)
  // filtrano su questo campo del messaggio stesso, senza dover risalire
  // alla conversazione con un get() - vedi commento in firestore.rules.
  const payload = {
    ...message,
    participantIds: conversation.participantIds,
    createdAt: new Date().toISOString(),
  }
  const ref = await addDoc(collection(db, MESSAGES), payload)
  const created = { id: ref.id, ...payload }

  const recipientId =
    conversation.participant1Id === message.userId
      ? conversation.participant2Id
      : conversation.participant1Id
  await notifyUser({
    userId: recipientId,
    actorId: message.userId,
    type: 'message',
    message: `${await actorName(message.userId)} ti ha inviato un messaggio`,
    conversationId: message.conversationId,
  })

  return created
}

export async function markMessageRead(id) {
  await updateDoc(doc(db, MESSAGES, id), { read: true })
  const snapshot = await getDoc(doc(db, MESSAGES, id))
  return toDoc(snapshot)
}

export async function fetchUnreadCount(conversationId, userId) {
  const snapshot = await getDocs(
    query(
      collection(db, MESSAGES),
      where('conversationId', '==', conversationId),
      where('participantIds', 'array-contains', userId),
      where('read', '==', false),
    ),
  )
  return snapshot.docs.filter((d) => d.data().userId !== userId).length
}

export async function updateMessage(id, changes) {
  await updateDoc(doc(db, MESSAGES, id), changes)
  const snapshot = await getDoc(doc(db, MESSAGES, id))
  return toDoc(snapshot)
}

export async function deleteMessage(id) {
  await deleteDoc(doc(db, MESSAGES, id))
  return id
}
