import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Avatar from '../common/Avatar'

export default function ProfileCard({ user, isOwnProfile, onEdit, onMessage }) {
  return (
    <Card className="mb-4 shadow-sm overflow-hidden">
      <div className="profile-cover" />
      <Card.Body className="text-center">
        <Avatar user={user} size={104} className="mt-n5 mb-3 border border-4 border-white" />
        <h1 className="h4 mb-0">{user.fullName}</h1>
        {user.jobTitle && <p className="text-secondary mb-1">{user.jobTitle}</p>}
        <p className="text-secondary small mb-2">@{user.username}</p>
        {user.bio && <p className="mb-3">{user.bio}</p>}
        {isOwnProfile ? (
          <Button variant="outline-primary" onClick={onEdit}>
            <i className="bi bi-pencil me-1"></i>Modifica profilo
          </Button>
        ) : (
          <Button variant="primary" onClick={onMessage}>
            <i className="bi bi-chat-dots me-1"></i>Invia messaggio
          </Button>
        )}
      </Card.Body>
    </Card>
  )
}
