import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ListGroup from 'react-bootstrap/ListGroup'
import Avatar from '../common/Avatar'
import EmptyState from '../common/EmptyState'
import RowSkeleton from '../common/RowSkeleton'
import { selectConversations, selectConversationsStatus } from '../../features/messages/messagesSlice'
import { selectUserById } from '../../features/users/usersSlice'
import { selectCurrentUser } from '../../features/auth/authSlice'
import { selectIsUserOnline } from '../../features/presence/presenceSlice'

function ConversationRow({ conversation, currentUserId, isActive }) {
  const otherUserId =
    conversation.participant1Id === currentUserId
      ? conversation.participant2Id
      : conversation.participant1Id
  const otherUser = useSelector(selectUserById(otherUserId))
  const isOnline = useSelector(selectIsUserOnline(otherUserId))

  return (
    <ListGroup.Item
      as={Link}
      to={`/messages/${conversation.id}`}
      active={isActive}
      className="d-flex align-items-center gap-2 animate-fade-in"
    >
      <Avatar user={otherUser} size={40} online={isOnline} />
      <span className="fw-semibold">{otherUser?.fullName || 'Utente'}</span>
    </ListGroup.Item>
  )
}

export default function ConversationList({ activeConversationId }) {
  const conversations = useSelector(selectConversations)
  const status = useSelector(selectConversationsStatus)
  const currentUser = useSelector(selectCurrentUser)

  if (status === 'loading' && conversations.length === 0) {
    return (
      <div>
        <RowSkeleton avatarSize={40} lines={1} />
        <RowSkeleton avatarSize={40} lines={1} />
        <RowSkeleton avatarSize={40} lines={1} />
      </div>
    )
  }

  if (status === 'succeeded' && conversations.length === 0) {
    return (
      <EmptyState
        icon="bi-chat-square-dots"
        title="Nessuna conversazione"
        description="Visita il profilo di un utente per iniziare a chattare."
      />
    )
  }

  return (
    <ListGroup>
      {conversations.map((conversation) => (
        <ConversationRow
          key={conversation.id}
          conversation={conversation}
          currentUserId={currentUser.id}
          isActive={conversation.id === activeConversationId}
        />
      ))}
    </ListGroup>
  )
}
