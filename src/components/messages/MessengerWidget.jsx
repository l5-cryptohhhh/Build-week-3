import { useState } from 'react'
import { useSelector } from 'react-redux'
import Badge from 'react-bootstrap/Badge'
import Avatar from '../common/Avatar'
import EmptyState from '../common/EmptyState'
import ConversationView from './ConversationView'
import {
  selectConversations,
  selectTotalUnreadMessages,
  selectUnreadCountForConversation,
} from '../../features/messages/messagesSlice'
import { selectUserById } from '../../features/users/usersSlice'
import { selectCurrentUser } from '../../features/auth/authSlice'
import { selectIsUserOnline } from '../../features/presence/presenceSlice'

function ConversationRow({ conversation, currentUserId, onOpen }) {
  const otherUserId =
    conversation.participant1Id === currentUserId
      ? conversation.participant2Id
      : conversation.participant1Id
  const otherUser = useSelector(selectUserById(otherUserId))
  const isOnline = useSelector(selectIsUserOnline(otherUserId))
  const unreadCount = useSelector(selectUnreadCountForConversation(conversation.id))

  return (
    <button
      type="button"
      className="btn d-flex align-items-center gap-2 w-100 text-start px-3 py-2 border-0 rounded-0"
      onClick={() => onOpen(conversation.id)}
    >
      <Avatar user={otherUser} size={36} online={isOnline} />
      <span className="fw-semibold text-truncate flex-grow-1">{otherUser?.fullName || 'Utente'}</span>
      {unreadCount > 0 && (
        <Badge bg="danger" pill style={{ fontSize: '0.65rem' }}>
          {unreadCount}
        </Badge>
      )}
    </button>
  )
}

export default function MessengerWidget() {
  const currentUser = useSelector(selectCurrentUser)
  const conversations = useSelector(selectConversations)
  const totalUnread = useSelector(selectTotalUnreadMessages)
  const [isListOpen, setIsListOpen] = useState(false)
  const [openConversationId, setOpenConversationId] = useState(null)

  const handleToggleList = () => {
    setIsListOpen((prev) => {
      if (prev) setOpenConversationId(null)
      return !prev
    })
  }

  return (
    <div
      className="position-fixed bottom-0 end-0 me-3"
      style={{ zIndex: 1040, width: 'min(300px, calc(100vw - 1.5rem))' }}
    >
      <div className="bg-body border rounded-top-3 shadow-lg">
        <button
          type="button"
          className="btn d-flex align-items-center gap-2 w-100 px-3 py-2 border-0 rounded-0 fw-semibold"
          onClick={handleToggleList}
        >
          <i className="bi bi-chat-dots-fill text-primary"></i>
          Messaggistica
          {totalUnread > 0 && (
            <Badge bg="danger" pill style={{ fontSize: '0.65rem' }}>
              {totalUnread}
            </Badge>
          )}
          <i className={`bi ${isListOpen ? 'bi-chevron-down' : 'bi-chevron-up'} ms-auto`}></i>
        </button>

        {isListOpen && openConversationId && (
          <div className="border-top p-2" style={{ height: 360 }}>
            <ConversationView
              conversationId={openConversationId}
              compact
              onClose={() => setOpenConversationId(null)}
            />
          </div>
        )}

        {isListOpen && !openConversationId && (
          <div className="border-top overflow-auto" style={{ maxHeight: 360 }}>
            {conversations.length === 0 ? (
              <div className="p-3">
                <EmptyState
                  icon="bi-chat-square-dots"
                  title="Nessuna conversazione"
                  description="Visita un profilo per iniziare a chattare."
                />
              </div>
            ) : (
              conversations.map((conversation) => (
                <ConversationRow
                  key={conversation.id}
                  conversation={conversation}
                  currentUserId={currentUser.id}
                  onOpen={setOpenConversationId}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
