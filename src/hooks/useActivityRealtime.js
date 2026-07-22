import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import {
  postReceived,
  postUpdatedFromSocket,
  postDeletedFromSocket,
  likeReceived,
  likeRemovedFromSocket,
} from '../features/posts/postsSlice'
import {
  commentReceived,
  commentUpdatedFromSocket,
  commentDeletedFromSocket,
} from '../features/comments/commentsSlice'
import { followReceived, followRemovedFromSocket } from '../features/follow/followSlice'

// Sostituisce useActivitySocket (prima: socket.io + server/realtime.js che
// riemetteva post/commenti/like/follow a tutti i client, `io.emit`, dati
// pubblici tra utenti loggati). Qui ogni collection ha un proprio listener
// Firestore, limitato alle ultime 200 righe: dedup by id gia' gestito dai
// reducer *Received/*UpdatedFromSocket/*DeletedFromSocket (chi compie
// l'azione riceve sia l'esito ottimistico del proprio thunk sia l'eco di
// questo stesso snapshot). Le regole read=isSignedIn() su queste 4
// collection non dipendono da altri documenti, quindi i listener "list"
// senza filtri sono ammessi dalle Security Rules.
const REALTIME_WINDOW = 200

function watchCollection(name) {
  return query(collection(db, name), orderBy('createdAt', 'desc'), limit(REALTIME_WINDOW))
}

export default function useActivityRealtime() {
  const dispatch = useDispatch()

  useEffect(() => {
    const unsubscribePosts = onSnapshot(watchCollection('posts'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const post = { id: change.doc.id, ...change.doc.data() }
        if (change.type === 'added') dispatch(postReceived(post))
        if (change.type === 'modified') dispatch(postUpdatedFromSocket(post))
        if (change.type === 'removed') dispatch(postDeletedFromSocket({ id: post.id }))
      })
    })

    const unsubscribeComments = onSnapshot(watchCollection('comments'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const comment = { id: change.doc.id, ...change.doc.data() }
        if (change.type === 'added') dispatch(commentReceived(comment))
        if (change.type === 'modified') dispatch(commentUpdatedFromSocket(comment))
        if (change.type === 'removed') {
          dispatch(commentDeletedFromSocket({ id: comment.id, postId: comment.postId }))
        }
      })
    })

    const unsubscribeLikes = onSnapshot(watchCollection('likes'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const like = { id: change.doc.id, ...change.doc.data() }
        if (change.type === 'added') dispatch(likeReceived(like))
        if (change.type === 'removed') dispatch(likeRemovedFromSocket({ id: like.id }))
      })
    })

    const unsubscribeFollows = onSnapshot(watchCollection('follows'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const record = { id: change.doc.id, ...change.doc.data() }
        if (change.type === 'added') dispatch(followReceived(record))
        if (change.type === 'removed') dispatch(followRemovedFromSocket({ id: record.id }))
      })
    })

    return () => {
      unsubscribePosts()
      unsubscribeComments()
      unsubscribeLikes()
      unsubscribeFollows()
    }
  }, [dispatch])
}
