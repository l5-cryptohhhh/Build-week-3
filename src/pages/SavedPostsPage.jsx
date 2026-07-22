import { useEffect } from 'react'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import PostCard from '../components/posts/PostCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { selectCurrentUser } from '../features/auth/authSlice'
import { fetchSavedPosts, selectSavedPosts, selectSavedPostsStatus } from '../features/posts/postsSlice'

export default function SavedPostsPage() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const savedPostIds = currentUser.savedPostIds || []
  const items = useSelector(selectSavedPosts, shallowEqual)
  const status = useSelector(selectSavedPostsStatus)

  useEffect(() => {
    dispatch(fetchSavedPosts(savedPostIds))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, currentUser.savedPostIds])

  // I post arrivano dal backend senza un ordine garantito rispetto a
  // savedPostIds (piu' recente salvato per primo): si riordina lato client.
  const posts = savedPostIds.map((id) => items.find((post) => post.id === id)).filter(Boolean)

  return (
    <Row>
      <Col lg={8} className="mx-auto">
        <h1 className="h5 mb-3">Elementi salvati</h1>
        {status === 'loading' && posts.length === 0 && (
          <LoadingSpinner label="Caricamento elementi salvati..." />
        )}
        {status === 'succeeded' && posts.length === 0 && (
          <EmptyState
            icon="bi-bookmark"
            title="Nessun elemento salvato"
            description="I post che salvi compariranno qui."
          />
        )}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </Col>
    </Row>
  )
}
