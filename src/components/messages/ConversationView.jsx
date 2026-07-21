import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorAlert from '../common/ErrorAlert'
import EmptyState from '../common/EmptyState'
import MessageBubble from './MessageBubble'
import MessageForm from './MessageForm'
import useInterval from '../../hooks/useInterval'
import {
  fetchMessages,
  sendMessage,
  editMessage,
  removeMessage,
  markMessageAsRead,
  selectMessagesForConversation,
  selectMessagesStatus,
  selectConversations,
  selectConversationsStatus,
} from '../../features/messages/messagesSlice'
import { selectUserById } from '../../features/users/usersSlice'
import { selectCurrentUser } from '../../features/auth/authSlice'

const MESSAGES_POLL_INTERVAL_MS = 4000

export default function ConversationView({ conversationId }) {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const messages = useSelector(selectMessagesForConversation(conversationId))
  const status = useSelector(selectMessagesStatus)
  const conversations = useSelector(selectConversations)
  const conversationsStatus = useSelector(selectConversationsStatus)
  const bottomRef = useRef(null)

  // Solo le conversazioni gia' caricate per l'utente corrente (fetchConversationsForUser)
  // possono comparire qui: questo e' il controllo lato client che impedisce di leggere i
  // messaggi di una conversazione altrui digitando /messages/:id a mano.
  const conversation = conversations.find((item) => item.id === conversationId)
  const otherUserId = conversation
    ? conversation.participant1Id === currentUser.id
      ? conversation.participant2Id
      : conversation.participant1Id
    : null
  const otherUser = useSelector(selectUserById(otherUserId))

  useEffect(() => {
    if (conversation) {
      dispatch(fetchMessages(conversationId))
    }
  }, [dispatch, conversationId, conversation])

  useInterval(
    () => {
      if (conversation) dispatch(fetchMessages(conversationId))
    },
    conversation ? MESSAGES_POLL_INTERVAL_MS : null,
  )

  useEffect(() => {
    messages
      .filter((message) => message.userId !== currentUser.id && !message.read)
      .forEach((message) => dispatch(markMessageAsRead(message.id)))
  }, [messages, currentUser.id, dispatch])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length])

  if (conversationsStatus === 'loading' && !conversation) {
    return <LoadingSpinner label="Caricamento conversazione..." />
  }

  if (!conversation) {
    return <ErrorAlert message="Conversazione non trovata o accesso non autorizzato." />
  }

  const handleSend = (content) => {
    dispatch(sendMessage({ conversationId, userId: currentUser.id, content }))
  }

  const handleEdit = (messageId, content) => {
    dispatch(editMessage({ id: messageId, content }))
  }

  const handleDelete = (messageId) => {
    if (window.confirm('Eliminare questo messaggio?')) {
      dispatch(removeMessage({ id: messageId, conversationId }))
    }
  }

  if (status === 'loading' && messages.length === 0) {
    return <LoadingSpinner label="Caricamento messaggi..." />
  }

  return (
    <div className="d-flex flex-column" style={{ height: '65vh' }}>
      <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
        <span className="fw-semibold">{otherUser?.fullName || 'Conversazione'}</span>
      </div>
      <div className="flex-grow-1 overflow-auto mb-3">
        {messages.length === 0 ? (
          <EmptyState
            icon="bi-chat-dots"
            title="Nessun messaggio"
            description="Scrivi il primo messaggio!"
          />
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.userId === currentUser.id}
              onEdit={(content) => handleEdit(message.id, content)}
              onDelete={() => handleDelete(message.id)}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <MessageForm onSubmit={handleSend} />
    </div>
  )
}
