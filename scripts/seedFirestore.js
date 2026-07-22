// Migrazione una tantum dei dati demo (prima in server/db.seed.json, ora
// scripts/demoData.json) su un progetto Firebase reale: crea gli utenti in
// Firebase Auth (stessa password demo per tutti, vedi README) e popola
// Firestore con post/commenti/like/conversazioni/messaggi, rimappando gli
// id numerici del vecchio json-server sui nuovi id (uid Firebase per gli
// utenti, id documento auto-generati per il resto).
//
// Uso: node scripts/seedFirestore.js
// Richiede scripts/serviceAccountKey.json (Firebase Console -> Impostazioni
// progetto -> Account di servizio -> Genera nuova chiave privata),
// gitignored perche' e' un segreto reale (a differenza del firebaseConfig
// pubblico del client, questo da' accesso admin illimitato al progetto.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEMO_PASSWORD = 'Password123!'

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json')
let serviceAccount
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))
} catch {
  console.error(
    `Manca ${serviceAccountPath}.\n` +
      'Scaricala da Firebase Console -> Impostazioni progetto -> Account di servizio -> ' +
      'Genera nuova chiave privata, e salvala esattamente a questo percorso (e\' gia\' nel .gitignore).',
  )
  process.exit(1)
}

initializeApp({ credential: cert(serviceAccount) })
const auth = getAuth()
const db = getFirestore()

const demoData = JSON.parse(readFileSync(path.join(__dirname, 'demoData.json'), 'utf8'))

async function getOrCreateAuthUser(email) {
  try {
    const existing = await auth.getUserByEmail(email)
    return existing.uid
  } catch {
    const created = await auth.createUser({ email, password: DEMO_PASSWORD, emailVerified: true })
    return created.uid
  }
}

async function seedUsers() {
  const userIdMap = new Map()
  for (const user of demoData.users) {
    const uid = await getOrCreateAuthUser(user.email)
    userIdMap.set(user.id, uid)
    await db
      .collection('users')
      .doc(uid)
      .set({
        email: user.email,
        username: user.username,
        usernameLower: user.username.toLowerCase(),
        fullName: user.fullName,
        fullNameLower: user.fullName.toLowerCase(),
        jobTitle: user.jobTitle || '',
        avatarUrl: user.avatarUrl || '',
        coverUrl: user.coverUrl || '',
        bio: user.bio || '',
        experiences: [],
        savedPostIds: [],
        createdAt: user.createdAt,
      })
    console.log(`  utente ${user.email} -> ${uid}`)
  }
  return userIdMap
}

async function seedPosts(userIdMap) {
  const postIdMap = new Map()
  for (const post of demoData.posts) {
    const ref = await db.collection('posts').add({
      userId: userIdMap.get(post.userId),
      content: post.content,
      contentLower: (post.content || '').toLowerCase(),
      imageUrl: post.imageUrl || '',
      createdAt: post.createdAt,
      updatedAt: post.updatedAt || post.createdAt,
    })
    postIdMap.set(post.id, ref.id)
  }
  return postIdMap
}

async function seedComments(userIdMap, postIdMap) {
  for (const comment of demoData.comments || []) {
    await db.collection('comments').add({
      postId: postIdMap.get(comment.postId),
      userId: userIdMap.get(comment.userId),
      content: comment.content,
      createdAt: comment.createdAt,
    })
  }
}

async function seedLikes(userIdMap, postIdMap) {
  for (const like of demoData.likes || []) {
    const postId = postIdMap.get(like.postId)
    const userId = userIdMap.get(like.userId)
    await db
      .collection('likes')
      .doc(`${postId}_${userId}`)
      .set({ postId, userId, createdAt: like.createdAt || new Date().toISOString() })
  }
}

async function seedConversations(userIdMap) {
  const conversationIdMap = new Map()
  for (const conversation of demoData.conversations || []) {
    const participant1Id = userIdMap.get(conversation.participant1Id)
    const participant2Id = userIdMap.get(conversation.participant2Id)
    const ref = await db.collection('conversations').add({
      participant1Id,
      participant2Id,
      participantIds: [participant1Id, participant2Id],
      createdAt: conversation.createdAt,
    })
    conversationIdMap.set(conversation.id, { id: ref.id, participantIds: [participant1Id, participant2Id] })
  }
  return conversationIdMap
}

async function seedMessages(userIdMap, conversationIdMap) {
  for (const message of demoData.messages || []) {
    const conversation = conversationIdMap.get(message.conversationId)
    if (!conversation) continue
    await db.collection('messages').add({
      conversationId: conversation.id,
      participantIds: conversation.participantIds,
      userId: userIdMap.get(message.userId),
      content: message.content,
      read: Boolean(message.read),
      createdAt: message.createdAt,
    })
  }
}

async function main() {
  console.log('Creo utenti (Auth + Firestore)...')
  const userIdMap = await seedUsers()

  console.log('Creo post...')
  const postIdMap = await seedPosts(userIdMap)

  console.log('Creo commenti...')
  await seedComments(userIdMap, postIdMap)

  console.log('Creo like...')
  await seedLikes(userIdMap, postIdMap)

  console.log('Creo conversazioni...')
  const conversationIdMap = await seedConversations(userIdMap)

  console.log('Creo messaggi...')
  await seedMessages(userIdMap, conversationIdMap)

  console.log('Fatto. Credenziali demo: una qualsiasi email dei seed, password ' + DEMO_PASSWORD)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
