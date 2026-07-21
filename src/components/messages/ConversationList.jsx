import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ListGroup from 'react-bootstrap/ListGroup'
import Avatar from '../common/Avatar'
import EmptyState from '../common/EmptyState'
import LoadingSpinner from '../common/LoadingSpinner'
import {
  selectConversations,
  selectConversationsStatus,
  selectUnreadCountForConversation,
} from '../../features/messages/messagesSlice'
import { selectUserById } from '../../features/users/usersSlice'
import { selectCurrentUser } from '../../features/auth/authSlice'

function ConversationRow({ conversation, currentUserId, isActive }) {
  const otherUserId =
    conversation.participant1Id === currentUserId
      ? conversation.participant2Id
      : conversation.participant1Id
  const otherUser = useSelector(selectUserById(otherUserId))
  const unreadCount = useSelector(selectUnreadCountForConversation(conversation.id))
  const hasUnread = !isActive && unreadCount > 0

  return (
    <ListGroup.Item
      as={Link}
      to={`/messages/${conversation.id}`}
      active={isActive}
      className={`d-flex align-items-center gap-2 position-relative${
        hasUnread ? ' conversation-row-unread' : ''
      }`}
    >
      <div className="position-relative">
        <Avatar user={otherUser} size={40} />
        {hasUnread && (
          <span
            className="unread-dot"
            role="status"
            aria-label={`${unreadCount} messaggi non letti`}
          />
        )}
      </div>
      <span className={hasUnread ? 'fw-bold' : 'fw-semibold'}>
        {otherUser?.fullName || 'Utente'}
      </span>
    </ListGroup.Item>
  )
}

export default function ConversationList({ activeConversationId }) {
  const conversations = useSelector(selectConversations)
  const status = useSelector(selectConversationsStatus)
  const currentUser = useSelector(selectCurrentUser)

  if (status === 'loading' && conversations.length === 0) {
    return <LoadingSpinner label="Caricamento conversazioni..." />
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
