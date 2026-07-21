import { useSelector } from 'react-redux'
import Modal from 'react-bootstrap/Modal'
import EmptyState from '../common/EmptyState'
import UserResultItem from '../search/UserResultItem'
import { selectUserById } from '../../features/users/usersSlice'

function FollowListRow({ userId }) {
  const user = useSelector(selectUserById(userId))
  if (!user) return null
  return <UserResultItem user={user} />
}

export default function FollowListModal({ show, onClose, title, userIds }) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="h6 mb-0">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {userIds.length === 0 ? (
          <EmptyState icon="bi-people" title="Nessun utente da mostrare" />
        ) : (
          <div className="d-flex flex-column gap-1">
            {userIds.map((userId) => (
              <FollowListRow key={userId} userId={userId} />
            ))}
          </div>
        )}
      </Modal.Body>
    </Modal>
  )
}
