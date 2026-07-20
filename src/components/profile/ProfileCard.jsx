import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Avatar from '../common/Avatar'

export default function ProfileCard({ user, isOwnProfile, onEdit, onMessage }) {
  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start gap-3">
        <Avatar user={user} size={88} />
        <div className="flex-grow-1 text-center text-sm-start">
          <h1 className="h4 mb-0">{user.fullName}</h1>
          <p className="text-secondary mb-2">@{user.username}</p>
          {user.bio && <p className="mb-0">{user.bio}</p>}
        </div>
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
