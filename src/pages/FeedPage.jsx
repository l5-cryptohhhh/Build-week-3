import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Card from 'react-bootstrap/Card'
import PostForm from '../components/posts/PostForm'
import PostList from '../components/posts/PostList'
import { createPost } from '../features/posts/postsSlice'
import { fetchAllUsers } from '../features/users/usersSlice'
import { selectCurrentUser } from '../features/auth/authSlice'

export default function FeedPage() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)

  useEffect(() => {
    dispatch(fetchAllUsers())
  }, [dispatch])

  const handleCreatePost = (content) => {
    const now = new Date().toISOString()
    dispatch(
      createPost({
        userId: currentUser.id,
        content,
        imageUrl: '',
        createdAt: now,
        updatedAt: now,
      }),
    )
  }

  return (
    <div>
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <PostForm submitLabel="Pubblica" onSubmit={handleCreatePost} />
        </Card.Body>
      </Card>
      <PostList />
    </div>
  )
}
