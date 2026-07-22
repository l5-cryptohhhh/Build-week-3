import { Link } from 'react-router-dom'
import { useSelector, shallowEqual } from 'react-redux'
import Card from 'react-bootstrap/Card'
import Avatar from '../common/Avatar'
import { selectMutualIds } from '../../features/follow/followSlice'
import { selectUserById } from '../../features/users/usersSlice'

function ConnectionRow({ userId }) {
  const user = useSelector(selectUserById(userId))
  if (!user) return null
  return (
    <Link
      to={`/profile/${userId}`}
      className="d-flex align-items-center gap-2 text-decoration-none text-dark py-1"
    >
      <Avatar user={user} size={32} />
      <span className="small text-truncate">{user.fullName}</span>
    </Link>
  )
}

export default function ConnectionsCard({ userId }) {
  const mutualIds = useSelector(selectMutualIds(userId), shallowEqual)

  return (
    <Card className="shadow-sm mt-3">
      <Card.Body>
        <Card.Title className="h6 mb-2">Collegamenti</Card.Title>
        {mutualIds.length === 0 ? (
          <p className="text-secondary small mb-0">Nessun collegamento reciproco.</p>
        ) : (
          <div className="d-flex flex-column">
            {mutualIds.map((id) => (
              <ConnectionRow key={id} userId={id} />
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  )
}
