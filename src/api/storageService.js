import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase'

// Solo i video dei post passano da qui: avatar/copertina/foto post sono
// base64 diretti nei documenti Firestore (niente Storage, niente carta di
// credito richiesta - vedi CHECKPOINT.md), un video da 50MB invece non
// potrebbe mai starci in un documento da 1MB.
export async function uploadPostMedia(uid, file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
  const storageRef = ref(storage, `posts/${uid}/${Date.now()}_${safeName}`)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
