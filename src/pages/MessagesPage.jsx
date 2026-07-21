import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import ConversationList from '../components/messages/ConversationList'
import ConversationView from '../components/messages/ConversationView'
import EmptyState from '../components/common/EmptyState'
import { fetchConversations } from '../features/messages/messagesSlice'
import { fetchAllUsers } from '../features/users/usersSlice'
import { selectCurrentUser } from '../features/auth/authSlice'

export default function MessagesPage() {
  const { conversationId } = useParams()
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)

  useEffect(() => {
    dispatch(fetchConversations(currentUser.id))
    dispatch(fetchAllUsers())
  }, [dispatch, currentUser.id])

  return (
    <Row className="g-3">
      <Col md={4} className={conversationId ? 'd-none d-md-block' : ''}>
        <ConversationList activeConversationId={conversationId ? Number(conversationId) : null} />
      </Col>
      <Col md={8} className={!conversationId ? 'd-none d-md-block' : ''}>
        {conversationId ? (
          <ConversationView conversationId={Number(conversationId)} />
        ) : (
          <EmptyState
            icon="bi-chat-square-text"
            title="Seleziona una conversazione"
            description="Scegli una conversazione dalla lista per iniziare a chattare."
          />
        )}
      </Col>
    </Row>
  )
}
