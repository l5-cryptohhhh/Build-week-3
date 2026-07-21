import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Avatar from '../common/Avatar'

export default function ProfileCard({
  user,
  isOwnProfile,
  isOnline,
  followersCount,
  followingCount,
  isFollowing,
  onEdit,
  onMessage,
  onToggleFollow,
  onShowFollowers,
  onShowFollowing,
}) {
  return (
    <Card className="mb-4 shadow-sm overflow-hidden">
      <div
        className="profile-cover"
        style={user.coverUrl ? { backgroundImage: `url(${user.coverUrl})` } : undefined}
      />
      <Card.Body className="text-center">
        <Avatar
          user={user}
          size={104}
          online={isOnline}
          className="mt-n5 mb-3 border border-4 border-white"
        />
        <h1 className="h4 mb-0">{user.fullName}</h1>
        {user.jobTitle && <p className="text-secondary mb-1">{user.jobTitle}</p>}
        <p className="text-secondary small mb-2">@{user.username}</p>
        {user.bio && <p className="mb-3">{user.bio}</p>}

        <div className="d-flex justify-content-center gap-4 mb-3 small">
          <button
            type="button"
            className="btn btn-link p-0 text-secondary text-decoration-none"
            onClick={onShowFollowers}
          >
            <strong className="text-dark">{followersCount}</strong> follower
          </button>
          <button
            type="button"
            className="btn btn-link p-0 text-secondary text-decoration-none"
            onClick={onShowFollowing}
          >
            <strong className="text-dark">{followingCount}</strong> seguiti
          </button>
        </div>

        {isOwnProfile ? (
          <Button variant="outline-primary" onClick={onEdit}>
            <i className="bi bi-pencil me-1"></i>Modifica profilo
          </Button>
        ) : (
          <div className="d-flex gap-2 justify-content-center">
            <Button
              variant={isFollowing ? 'outline-secondary' : 'primary'}
              onClick={onToggleFollow}
            >
              <i className={`bi ${isFollowing ? 'bi-person-check' : 'bi-person-plus'} me-1`}></i>
              {isFollowing ? 'Segui già' : 'Segui'}
            </Button>
            <Button variant="outline-primary" onClick={onMessage}>
              <i className="bi bi-chat-dots me-1"></i>Invia messaggio
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}
