import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Button from 'react-bootstrap/Button'
import PostCard from './PostCard'
import PostCardSkeleton from './PostCardSkeleton'
import ErrorAlert from '../common/ErrorAlert'
import EmptyState from '../common/EmptyState'
import {
  fetchPosts,
  selectAllPosts,
  selectPostsStatus,
  selectPostsError,
  selectPostsCursor,
  selectPostsLimit,
  selectPostsHasMore,
} from '../../features/posts/postsSlice'

export default function PostList() {
  const dispatch = useDispatch()
  const posts = useSelector(selectAllPosts)
  const status = useSelector(selectPostsStatus)
  const error = useSelector(selectPostsError)
  const cursor = useSelector(selectPostsCursor)
  const limit = useSelector(selectPostsLimit)
  const hasMore = useSelector(selectPostsHasMore)

  useEffect(() => {
    dispatch(fetchPosts({ limit }))
  }, [dispatch, limit])

  const handleLoadMore = () => {
    dispatch(fetchPosts({ cursor, limit }))
  }

  if (status === 'loading' && posts.length === 0) {
    return (
      <div>
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    )
  }

  if (status === 'failed' && posts.length === 0) {
    return <ErrorAlert message={error} onRetry={() => dispatch(fetchPosts({ limit }))} />
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
