import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Button from 'react-bootstrap/Button'
import PostCard from './PostCard'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorAlert from '../common/ErrorAlert'
import EmptyState from '../common/EmptyState'
import {
  fetchPosts,
  selectAllPosts,
  selectPostsStatus,
  selectPostsError,
  selectPostsPage,
  selectPostsLimit,
  selectPostsTotalCount,
} from '../../features/posts/postsSlice'

export default function PostList() {
  const dispatch = useDispatch()
  const posts = useSelector(selectAllPosts)
  const status = useSelector(selectPostsStatus)
  const error = useSelector(selectPostsError)
  const page = useSelector(selectPostsPage)
  const limit = useSelector(selectPostsLimit)
  const totalCount = useSelector(selectPostsTotalCount)

  useEffect(() => {
    dispatch(fetchPosts({ page: 1, limit }))
  }, [dispatch, limit])

  const handleLoadMore = () => {
    dispatch(fetchPosts({ page: page + 1, limit }))
  }

  if (status === 'loading' && posts.length === 0) {
    return <LoadingSpinner label="Caricamento post..." />
  }

  if (status === 'failed' && posts.length === 0) {
    return <ErrorAlert message={error} onRetry={() => dispatch(fetchPosts({ page: 1, limit }))} />
  }

  if (status === 'succeeded' && posts.length === 0) {
    return (
      <EmptyState
        icon="bi-journal-text"
        title="Nessun post ancora"
        description="Sii il primo a condividere qualcosa!"
      />
    )
  }

  const hasMore = posts.length < totalCount

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {hasMore && (
        <div className="text-center mb-3">
          <Button
            variant="outline-primary"
            onClick={handleLoadMore}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Caricamento...' : 'Carica altri post'}
          </Button>
        </div>
      )}
    </div>
  )
}
