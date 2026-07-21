import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Button from 'react-bootstrap/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import RowSkeleton from '../common/RowSkeleton'
import Skeleton from '../common/Skeleton'
import ErrorAlert from '../common/ErrorAlert'
import EmptyState from '../common/EmptyState'
import Avatar from '../common/Avatar'
import MessageBubble from './MessageBubble'
import MessageForm from './MessageForm'
import {
  fetchMessages,
  sendMessage,
  editMessage,
  removeMessage,
  markMessageAsRead,
  selectMessagesForConversation,
  selectMessagesStatus,
  selectMessagesPageForConversation,
  selectMessagesTotalForConversation,
  selectConversations,
  selectConversationsStatus,
  conversationMarkedRead,
} from '../../features/messages/messagesSlice'
import { selectUserById } from '../../features/users/usersSlice'
import { selectCurrentUser } from '../../features/auth/authSlice'
import { requestConfirm } from '../../utils/confirm'

// `compact`/`onClose` sono usati dal MessengerWidget (popup flottante in
// basso a destra): stessa logica di fetch/invio/paginazione della pagina
// messaggi a tutto schermo, solo altezza ridotta e un header con avatar +
// bottone di chiusura invece del semplice nome.
export default function ConversationView({ conversationId, compact = false, onClose }) {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const messages = useSelector(selectMessagesForConversation(conversationId))
  const status = useSelector(selectMessagesStatus)
  const page = useSelector(selectMessagesPageForConversation(conversationId))
  const totalCount = useSelector(selectMessagesTotalForConversation(conversationId))
  const conversations = useSelector(selectConversations)
  const conversationsStatus = useSelector(selectConversationsStatus)
  const bottomRef = useRef(null)
  const scrollRef = useRef(null)
  const isLoadingMoreRef = useRef(false)
  const prevScrollHeightRef = useRef(0)

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
      dispatch(fetchMessages({ conversationId, page: 1 }))
      dispatch(conversationMarkedRead(conversationId))
    }
  }, [dispatch, conversationId, conversation])

  useEffect(() => {
    messages
      .filter((message) => message.userId !== currentUser.id && !message.read)
      .forEach((message) => dispatch(markMessageAsRead(message.id)))
  }, [messages, currentUser.id, dispatch])

  useEffect(() => {
    if (isLoadingMoreRef.current) {
      // Messaggi piu' vecchi anteposti dal bottone "carica precedenti":
      // si ripristina l'offset di scroll invece di saltare in fondo, cosi'
      // la posizione di lettura dell'utente resta stabile.
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight - prevScrollHeightRef.current
      }
      isLoadingMoreRef.current = false
      return
    }
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length])

  const handleLoadPrevious = () => {
    if (scrollRef.current) prevScrollHeightRef.current = scrollRef.current.scrollHeight
    isLoadingMoreRef.current = true
    dispatch(fetchMessages({ conversationId, page: page + 1 }))
  }

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

  const handleDelete = async (messageId) => {
    const confirmed = await requestConfirm({
      title: 'Eliminare il messaggio',
      message: 'Eliminare questo messaggio?',
      confirmLabel: 'Elimina',
    })
    if (confirmed) dispatch(removeMessage({ id: messageId, conversationId }))
  }

  const height = compact ? '360px' : '65vh'

  if (status === 'loading' && messages.length === 0) {
    return (
      <div className="d-flex flex-column" style={{ height }}>
        <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
          <Skeleton width="40%" height="1rem" />
        </div>
        <div className="flex-grow-1">
          <RowSkeleton avatarSize={28} lines={1} />
          <RowSkeleton avatarSize={28} lines={1} />
          <RowSkeleton avatarSize={28} lines={1} />
        </div>
      </div>
    )
  }

  const hasMore = messages.length < totalCount

  return (
    <div className="d-flex flex-column" style={{ height }}>
      <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
        {compact && <Avatar user={otherUser} size={28} />}
        <span className="fw-semibold text-truncate">{otherUser?.fullName || 'Conversazione'}</span>
        {onClose && (
          <button
            type="button"
            className="btn btn-sm btn-link text-secondary p-0 ms-auto"
            onClick={onClose}
            aria-label="Chiudi chat"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        )}
      </div>
      <div ref={scrollRef} className="flex-grow-1 overflow-auto mb-3">
        {hasMore && (
          <div className="text-center mb-2">
            <Button
              size="sm"
              variant="outline-secondary"
              disabled={status === 'loading'}
              onClick={handleLoadPrevious}
            >
              {status === 'loading' ? 'Caricamento...' : 'Carica messaggi precedenti'}
            </Button>
          </div>
        )}
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
