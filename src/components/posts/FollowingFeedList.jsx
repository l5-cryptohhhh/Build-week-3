import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Button from 'react-bootstrap/Button'
import PostCard from './PostCard'
import PostCardSkeleton from './PostCardSkeleton'
import EmptyState from '../common/EmptyState'
import { fetchFollowingFeed, selectFollowingFeed } from '../../features/posts/postsSlice'
import { selectFollowingIds } from '../../features/follow/followSlice'
import { selectCurrentUser } from '../../features/auth/authSlice'

export default function FollowingFeedList() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const followingIds = useSelector(selectFollowingIds(currentUser.id))
  const { items: posts, status, cursor, limit, hasMore } = useSelector(selectFollowingFeed)

  useEffect(() => {
    if (followingIds.length === 0) return
    dispatch(fetchFollowingFeed({ limit, followingIds }))
    // followingIds.join per evitare un fetch ad ogni nuovo array (stesso contenuto, riferimento diverso)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, limit, followingIds.join(',')])

  if (followingIds.length === 0) {
    return (
      <EmptyState
        icon="bi-person-heart"
        title="Non segui ancora nessuno"
        description="Visita un profilo e premi Segui per vedere qui i suoi post."
      />
    )
  }

  if (status === 'loading' && posts.length === 0) {
    return (
      <div>
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    )
  }

  if (status === 'succeeded' && posts.length === 0) {
    return (
      <EmptyState
        icon="bi-journal-text"
        title="Nessun post da chi segui"
        description="Le persone che segui non hanno ancora pubblicato nulla."
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
            disabled={status === 'loading'}
            onClick={() => dispatch(fetchFollowingFeed({ cursor, limit, followingIds }))}
          >
            {status === 'loading' ? 'Caricamento...' : 'Carica altri post'}
          </Button>
        </div>
      )}
    </div>
  )
}
