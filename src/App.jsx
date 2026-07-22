import { useEffect } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { store } from './app/store'
import { restoreSession, logout, selectCurrentUser, selectAuthToken } from './features/auth/authSlice'
import { fetchNotifications } from './features/notifications/notificationsSlice'
import { fetchConversations, fetchUnreadCounts } from './features/messages/messagesSlice'
import { connectSocket, disconnectSocket } from './socket'
import usePresenceSocket from './hooks/usePresenceSocket'
import useConversationSocket from './hooks/useConversationSocket'
import useActivitySocket from './hooks/useActivitySocket'
import AppRouter from './routes/AppRouter'
import ToastHost from './components/common/ToastHost'
import ConfirmModalHost from './components/common/ConfirmModalHost'
import TopLoadingBar from './components/common/TopLoadingBar'

function SessionBootstrap() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const token = useSelector(selectAuthToken)

  usePresenceSocket()
  useConversationSocket()
  useActivitySocket()

  useEffect(() => {
    dispatch(restoreSession())
  }, [dispatch])

  useEffect(() => {
    function handleExpired() {
      dispatch(logout())
      navigate('/login', { replace: true })
    }

    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [dispatch, navigate])

  useEffect(() => {
    if (currentUser && token) {
      connectSocket(token)
      dispatch(fetchNotifications(currentUser.id))
      dispatch(fetchConversations(currentUser.id)).then(() => {
        dispatch(fetchUnreadCounts(currentUser.id))
      })
    } else {
      disconnectSocket()
    }
  }, [dispatch, currentUser, token])

  return (
    <>
      <TopLoadingBar />
      <AppRouter />
      <ToastHost />
      <ConfirmModalHost />
    </>
  )
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <SessionBootstrap />
      </BrowserRouter>
    </Provider>
  )
}

export default App
