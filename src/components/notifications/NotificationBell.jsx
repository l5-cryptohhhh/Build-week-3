import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Dropdown from 'react-bootstrap/Dropdown'
import Badge from 'react-bootstrap/Badge'
import EmptyState from '../common/EmptyState'
import { formatRelativeTime } from '../../utils/dateFormat'
import {
  markNotificationRead,
  selectNotifications,
  selectUnreadNotificationsCount,
} from '../../features/notifications/notificationsSlice'

const TYPE_ICONS = {
  message: 'bi-chat-dots',
  comment: 'bi-chat-square-text',
  like: 'bi-hand-thumbs-up',
  follow: 'bi-person-plus',
}

export default function NotificationBell() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const notifications = useSelector(selectNotifications)
  const unreadCount = useSelector(selectUnreadNotificationsCount)
  const [isBumping, setIsBumping] = useState(false)
  const prevUnreadRef = useRef(unreadCount)

  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      setIsBumping(true)
      const timeout = setTimeout(() => setIsBumping(false), 600)
      prevUnreadRef.current = unreadCount
      return () => clearTimeout(timeout)
    }
    prevUnreadRef.current = unreadCount
  }, [unreadCount])

  const handleClick = (notification) => {
    if (!notification.read) dispatch(markNotificationRead(notification.id))
    if (notification.type === 'message') {
      navigate(`/messages/${notification.conversationId}`)
    } else if (notification.type === 'follow') {
      navigate(`/profile/${notification.actorId}`)
    } else {
      navigate('/')
    }
  }

  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        variant="link"
        className="text-secondary p-0 no-caret position-relative"
        id="notification-bell"
      >
        <i className={`bi bi-bell fs-5 ${isBumping ? 'bell-bump' : ''}`}></i>
        {unreadCount > 0 && (
          <Badge
            bg="danger"
            pill
            className="position-absolute top-0 start-100 translate-middle"
            style={{ fontSize: '0.6rem' }}
          >
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>
      <Dropdown.Menu style={{ minWidth: 320, maxHeight: 400, overflowY: 'auto' }}>
        <Dropdown.Header>Notifiche</Dropdown.Header>
        {notifications.length === 0 ? (
          <div className="px-3">
            <EmptyState icon="bi-bell-slash" title="Nessuna notifica" />
          </div>
        ) : (
          notifications.map((notification) => (
            <Dropdown.Item
              key={notification.id}
              onClick={() => handleClick(notification)}
              className={`d-flex align-items-start gap-2 animate-fade-in ${notification.read ? 'text-secondary' : 'fw-semibold'}`}
            >
              <i className={`bi ${TYPE_ICONS[notification.type] || 'bi-bell'} mt-1`}></i>
              <div>
                <div className="text-wrap small">{notification.message}</div>
                <div className="text-secondary" style={{ fontSize: '0.7rem' }}>
                  {formatRelativeTime(notification.createdAt)}
                </div>
              </div>
            </Dropdown.Item>
          ))
        )}
      </Dropdown.Menu>
    </Dropdown>
  )
}
