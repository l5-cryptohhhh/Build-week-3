import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Card from 'react-bootstrap/Card'
import Dropdown from 'react-bootstrap/Dropdown'
import { Link } from 'react-router-dom'
import Avatar from '../common/Avatar'
import PostForm from './PostForm'
import CommentList from '../comments/CommentList'
import { selectUserById } from '../../features/users/usersSlice'
import { selectCurrentUser } from '../../features/auth/authSlice'
import { updatePost, deletePost, toggleLike, selectLikesForPost } from '../../features/posts/postsSlice'
import { selectCommentsForPost } from '../../features/comments/commentsSlice'
import { formatRelativeTime } from '../../utils/dateFormat'
import { getLinkType, getYoutubeEmbedUrl } from '../../utils/linkPreview'

export default function PostCard({ post }) {
  const dispatch = useDispatch()
  const author = useSelector(selectUserById(post.userId))
  const currentUser = useSelector(selectCurrentUser)
  const likes = useSelector(selectLikesForPost(post.id))
  const comments = useSelector(selectCommentsForPost(post.id))
  const [isEditing, setIsEditing] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const isOwner = currentUser.id === post.userId
  const isLiked = likes.some((like) => like.userId === currentUser.id)

  const handleUpdate = ({ content, imageUrl }) => {
    dispatch(
      updatePost({ id: post.id, changes: { content, imageUrl, updatedAt: new Date().toISOString() } }),
    )
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm('Eliminare definitivamente questo post?')) {
      dispatch(deletePost(post.id))
    }
  }

  const handleToggleLike = () => {
    dispatch(toggleLike({ postId: post.id, userId: currentUser.id }))
  }

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Link
            to={`/profile/${post.userId}`}
            className="d-flex align-items-center text-decoration-none text-dark"
          >
            <Avatar user={author} size={40} className="me-2" />
            <div>
              <div className="fw-semibold">{author?.fullName || 'Utente'}</div>
              {author?.jobTitle && (
                <div className="text-secondary" style={{ fontSize: '0.8rem' }}>
                  {author.jobTitle}
                </div>
              )}
              <div className="text-secondary" style={{ fontSize: '0.8rem' }}>
                {formatRelativeTime(post.createdAt)}
                {post.updatedAt !== post.createdAt && ' (modificato)'}
              </div>
            </div>
          </Link>
          {isOwner && (
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="link"
                className="text-secondary p-0 no-caret"
                id={`post-menu-${post.id}`}
              >
                <i className="bi bi-three-dots"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setIsEditing(true)}>
                  <i className="bi bi-pencil me-2"></i>Modifica
                </Dropdown.Item>
                <Dropdown.Item className="text-danger" onClick={handleDelete}>
                  <i className="bi bi-trash me-2"></i>Elimina
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>

        {isEditing ? (
          <PostForm
            initialContent={post.content}
            initialImageUrl={post.imageUrl}
            submitLabel="Salva"
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            showImageField
          />
        ) : (
          <>
            <Card.Text className="mb-3" style={{ whiteSpace: 'pre-wrap' }}>
              {post.content}
            </Card.Text>
<<<<<<< HEAD
            {post.imageUrl && <PostLinkPreview url={post.imageUrl} />}
=======
            {post.imageUrl && (
              <img src={post.imageUrl} alt="" className="img-fluid rounded mb-3 w-100" />
            )}
>>>>>>> a6dfe14 (aggiornamento interfaccia e funzionalità)
          </>
        )}

        <div className="d-flex align-items-center gap-3 text-secondary">
          <button
            type="button"
            className={`btn btn-sm ${isLiked ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={handleToggleLike}
          >
            <i className={`bi ${isLiked ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'} me-1`}></i>
            {likes.length}
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setShowComments((prev) => !prev)}
          >
            <i className="bi bi-chat me-1"></i>
            {comments.length > 0 ? comments.length : ''} Commenti
          </button>
        </div>

        {showComments && <CommentList postId={post.id} />}
      </Card.Body>
    </Card>
  )
}

function PostLinkPreview({ url }) {
  const type = getLinkType(url)

  if (type === 'image') {
    return <img src={url} alt="" className="img-fluid rounded mb-3 w-100" />
  }

  if (type === 'video') {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video src={url} controls className="rounded mb-3 w-100" />
    )
  }

  if (type === 'youtube') {
    const embedUrl = getYoutubeEmbedUrl(url)
    return (
      <div className="ratio ratio-16x9 mb-3">
        <iframe src={embedUrl} title="Video" allowFullScreen className="rounded"></iframe>
      </div>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="d-flex align-items-center gap-2 border rounded p-2 mb-3 text-decoration-none text-truncate"
    >
      <i className="bi bi-link-45deg fs-5"></i>
      <span className="text-truncate">{url}</span>
    </a>
  )
}
