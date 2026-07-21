import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from 'react-bootstrap/Popover'
import Avatar from './Avatar'
import { selectFollowersCount } from '../../features/follow/followSlice'
import { selectIsUserOnline } from '../../features/presence/presenceSlice'

function HoverCardBody({ user }) {
  const followersCount = useSelector(selectFollowersCount(user.id))
  const isOnline = useSelector(selectIsUserOnline(user.id))

  return (
    <Popover.Body>
      <div className="d-flex align-items-center gap-2 mb-2">
        <Avatar user={user} size={48} online={isOnline} />
        <div>
          <div className="fw-semibold">{user.fullName}</div>
          {user.jobTitle && <div className="text-secondary small">{user.jobTitle}</div>}
        </div>
      </div>
      {user.bio && <p className="small mb-2 text-truncate">{user.bio}</p>}
      <div className="small text-secondary mb-2">
        <strong className="text-dark">{followersCount}</strong> follower
      </div>
      <Link to={`/profile/${user.id}`} className="btn btn-sm btn-outline-primary w-100">
        Vedi profilo
      </Link>
    </Popover.Body>
  )
}

// Wrapper generico: mostra un popover con anteprima del profilo al passaggio
// del mouse su qualunque contenuto (avatar, nome, ecc.) gli venga passato come
// figlio, senza dover ripetere la logica in ogni componente che mostra un utente.
export default function UserHoverCard({ user, children }) {
  if (!user) return children

  const popover = (
    <Popover id={`user-hover-${user.id}`} style={{ maxWidth: 260 }}>
      <HoverCardBody user={user} />
    </Popover>
  )

  return (
    <OverlayTrigger
      trigger={['hover', 'focus']}
      placement="bottom-start"
      delay={{ show: 350, hide: 100 }}
      overlay={popover}
    >
      <span className="d-inline-block">{children}</span>
    </OverlayTrigger>
  )
}
