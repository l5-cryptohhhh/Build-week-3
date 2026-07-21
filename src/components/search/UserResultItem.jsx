import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Avatar from '../common/Avatar'
import { selectIsUserOnline } from '../../features/presence/presenceSlice'

export default function UserResultItem({ user }) {
  const isOnline = useSelector(selectIsUserOnline(user.id))

  return (
    <Link
      to={`/profile/${user.id}`}
      className="d-flex align-items-center gap-3 p-2 rounded text-decoration-none text-dark animate-fade-in"
    >
      <Avatar user={user} size={44} online={isOnline} />
      <div>
        <div className="fw-semibold">{user.fullName}</div>
        {user.jobTitle ? (
          <div className="text-secondary small">{user.jobTitle}</div>
        ) : (
          <div className="text-secondary small">@{user.username}</div>
        )}
      </div>
    </Link>
  )
}
