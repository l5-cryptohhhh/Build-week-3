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
import NewsWidget from '../components/news/NewsWidget'
import AdWidget from '../components/news/AdWidget'
import PuzzlesWidget from '../components/games/PuzzlesWidget'
import SidebarFooter from '../components/layout/SidebarFooter'
import ConnectionsCard from '../components/profile/ConnectionsCard'
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

  const handleFeedSelect = (key) => {
    if (key === 'saved') return
    setFeedMode(key)
  }

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
            <div
              className="profile-cover"
              style={currentUser.coverUrl ? { backgroundImage: `url(${currentUser.coverUrl})` } : undefined}
            />
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

          <ConnectionsCard userId={currentUser.id} />

          <Card className="shadow-sm mt-3">
            <Card.Body className="p-2">
              <Link
                to="/saved"
                className="d-flex align-items-center gap-2 text-decoration-none text-dark p-1"
              >
                <i className="bi bi-bookmark-fill text-secondary"></i>
                <span>Elementi salvati</span>
              </Link>
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

        <Nav variant="pills" activeKey={feedMode} onSelect={handleFeedSelect} className="mb-3 gap-2">
          <Nav.Item>
            <Nav.Link eventKey="all">Tutti i post</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="following">
              <i className="bi bi-person-heart me-1"></i>Chi segui
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="d-lg-none">
            <Nav.Link as={Link} to="/saved" eventKey="saved">
              <i className="bi bi-bookmark-fill me-1"></i>Elementi salvati
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {feedMode === 'all' ? <PostList /> : <FollowingFeedList />}
      </Col>

      <Col lg={3} className="d-none d-lg-block">
        <div className="feed-sidebar">
          <NewsWidget />
          <PuzzlesWidget />
          <AdWidget />
          <SidebarFooter />
        </div>
      </Col>
    </Row>
  )
}
