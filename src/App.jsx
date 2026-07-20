import { useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './app/store'
import { restoreSession } from './features/auth/authSlice'
import AppRouter from './routes/AppRouter'

function SessionBootstrap() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(restoreSession())
  }, [dispatch])

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
