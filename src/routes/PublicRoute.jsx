import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectAuthInitialized, selectIsAuthenticated } from '../features/auth/authSlice'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function PublicRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const initialized = useSelector(selectAuthInitialized)

  if (!initialized) {
    return <LoadingSpinner label="Verifica sessione in corso..." />
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
