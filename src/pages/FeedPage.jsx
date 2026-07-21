import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Nav from 'react-bootstrap/Nav'
import PostForm from '../components/posts/PostForm'
import PostList from '../components/posts/PostList'
import FollowingFeedList from '../components/posts/FollowingFeedList'
import Avatar from '../components/common/Avatar'
import { createPost } from '../features/posts/postsSlice'
import { fetchAllUsers } from '../features/users/usersSlice'
import { fetchFollowData } from '../features/follow/followSlice'
import { selectCurrentUser } from '../features/auth/authSlice'

export default function FeedPage() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const [feedMode, setFeedMode] = useState('all')

  useEffect(() => {
    dispatch(fetchAllUsers())
    dispatch(fetchFollowData(currentUser.id))
  }, [dispatch, currentUser.id])

  const handleCreatePost = ({ content, imageUrl }) => {
    const now = new Date().toISOString()
    dispatch(
      createPost({
        userId: currentUser.id,
        content,
        imageUrl,
        createdAt: now,
        updatedAt: now,
      }),
    )
  }

  return (
    <Row className="g-4">
      <Col lg={3} className="d-none d-lg-block">
        <div className="feed-sidebar">
          <Card className="shadow-sm text-center overflow-hidden">
            <div className="profile-cover" />
            <Card.Body>
              <Link to={`/profile/${currentUser.id}`} className="text-decoration-none text-dark">
                <Avatar user={currentUser} size={72} className="mt-n5 mb-2 border border-3 border-white" />
                <h2 className="h6 mb-0">{currentUser.fullName}</h2>
              </Link>
              {currentUser.jobTitle && (
                <p className="text-secondary small mb-0">{currentUser.jobTitle}</p>
              )}
            </Card.Body>
          </Card>
        </div>
      </Col>

      <Col lg={6}>
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <PostForm submitLabel="Pubblica" onSubmit={handleCreatePost} showImageField />
          </Card.Body>
        </Card>

        <Nav variant="pills" activeKey={feedMode} onSelect={setFeedMode} className="mb-3 gap-2">
          <Nav.Item>
            <Nav.Link eventKey="all">Tutti i post</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="following">
              <i className="bi bi-person-heart me-1"></i>Chi segui
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {feedMode === 'all' ? <PostList /> : <FollowingFeedList />}
      </Col>

      <Col lg={3} className="d-none d-lg-block">
        <div className="feed-sidebar">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="h6">Novità della Build Week</Card.Title>
              <Card.Text className="small text-secondary mb-0">
                Questo è un progetto dimostrativo creato per il corso: un clone semplificato delle
                funzionalità principali di LinkedIn (feed, profilo, esperienze).
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
      </Col>
    </Row>
  )
}
