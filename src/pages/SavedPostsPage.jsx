import { useEffect } from 'react'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import PostCard from '../components/posts/PostCard'
import JobCard from '../components/jobs/JobCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { selectCurrentUser } from '../features/auth/authSlice'
import { fetchSavedPosts, selectSavedPosts, selectSavedPostsStatus } from '../features/posts/postsSlice'

export default function SavedPostsPage() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const savedPostIds = currentUser.savedPostIds || []
  const savedJobs = currentUser.savedJobs || []
  const items = useSelector(selectSavedPosts, shallowEqual)
  const status = useSelector(selectSavedPostsStatus)

  useEffect(() => {
    dispatch(fetchSavedPosts(savedPostIds))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, currentUser.savedPostIds])

  // I post arrivano dal backend senza un ordine garantito rispetto a
  // savedPostIds (piu' recente salvato per primo): si riordina lato client.
  const posts = savedPostIds.map((id) => items.find((post) => post.id === id)).filter(Boolean)
  const hasNothingSaved = posts.length === 0 && savedJobs.length === 0

  return (
    <Row>
      <Col lg={8} className="mx-auto">
        <h1 className="h5 mb-3">Elementi salvati</h1>
        {status === 'loading' && posts.length === 0 && (
          <LoadingSpinner label="Caricamento elementi salvati..." />
        )}
        {status !== 'loading' && hasNothingSaved && (
          <EmptyState
            icon="bi-bookmark"
            title="Nessun elemento salvato"
            description="I post e le offerte di lavoro che salvi compariranno qui."
          />
        )}
        {savedJobs.length > 0 && (
          <>
            {posts.length > 0 && <h2 className="h6 mb-3">Offerte di lavoro salvate</h2>}
            {savedJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </>
        )}
        {posts.length > 0 && savedJobs.length > 0 && <h2 className="h6 mb-3">Post salvati</h2>}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </Col>
    </Row>
  )
}
