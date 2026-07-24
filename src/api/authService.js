import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

function userDocRef(uid) {
  return doc(db, 'users', uid)
}

function toUser(uid, data) {
  return { id: uid, ...data }
}

export async function fetchUserProfile(uid) {
  const snapshot = await getDoc(userDocRef(uid))
  return snapshot.exists() ? toUser(uid, snapshot.data()) : null
}

export async function register({ email, password, username, fullName, jobTitle = '' }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  const profile = {
    email,
    username,
    usernameLower: username.toLowerCase(),
    fullName,
    fullNameLower: fullName.toLowerCase(),
    jobTitle,
    avatarUrl: '',
    coverUrl: '',
    bio: '',
    experiences: [],
    savedPostIds: [],
    createdAt: new Date().toISOString(),
  }
  await setDoc(userDocRef(credential.user.uid), profile)
  return toUser(credential.user.uid, profile)
}

export async function login({ email, password }) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  const user = await fetchUserProfile(credential.user.uid)
  if (!user) {
    throw new Error('Profilo utente non trovato.')
  }
  return user
}

export async function logout() {
  await signOut(auth)
}

// Sostituisce il vecchio restoreSession basato su JWT in localStorage:
// Firebase Auth mantiene la sessione da solo (IndexedDB + refresh automatico
// del token) e notifica ogni cambio di stato tramite questo listener,
// montato una sola volta in App.jsx. Il profilo esteso (username, avatar,
// bio...) vive in Firestore e va recuperato a parte, l'oggetto utente di
// Firebase Auth espone solo uid/email.
export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null)
      return
    }
    const user = await fetchUserProfile(firebaseUser.uid)
    callback(user)
  })
}
