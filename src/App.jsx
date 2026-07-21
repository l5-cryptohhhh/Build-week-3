import { useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { store } from './app/store'
import { restoreSession, logout } from './features/auth/authSlice'
import AppRouter from './routes/AppRouter'

function SessionBootstrap() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

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

  return <AppRouter />
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
