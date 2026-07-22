import { useEffect } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './app/store'
import { authStateChanged, selectCurrentUser } from './features/auth/authSlice'
import { subscribeToAuthChanges } from './api/authService'
import { fetchNotifications } from './features/notifications/notificationsSlice'
import { fetchConversations, fetchUnreadCounts } from './features/messages/messagesSlice'
import usePresence from './hooks/usePresence'
import useConversationsRealtime from './hooks/useConversationsRealtime'
import useActivityRealtime from './hooks/useActivityRealtime'
import useNotificationsRealtime from './hooks/useNotificationsRealtime'
import AppRouter from './routes/AppRouter'
import ToastHost from './components/common/ToastHost'
import ConfirmModalHost from './components/common/ConfirmModalHost'
import TopLoadingBar from './components/common/TopLoadingBar'

function SessionBootstrap() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)

  usePresence()
  useConversationsRealtime()
  useActivityRealtime()
  useNotificationsRealtime()

  // Sostituisce il vecchio restoreSession basato su JWT in localStorage:
  // Firebase Auth notifica login/logout/refresh token tramite questo unico
  // listener, montato una sola volta per l'intera sessione. Non serve piu'
  // un listener per token scaduti (l'SDK rinnova da solo finche' la sessione
  // e' valida, e altrimenti questo stesso evento porta gia' user a null).
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      dispatch(authStateChanged(user))
    })
    return unsubscribe
  }, [dispatch])

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchNotifications(currentUser.id))
      dispatch(fetchConversations(currentUser.id)).then(() => {
        dispatch(fetchUnreadCounts(currentUser.id))
      })
    }
  }, [dispatch, currentUser])

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
