import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectAuthInitialized, selectIsAuthenticated } from '../features/auth/authSlice'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function ProtectedRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const initialized = useSelector(selectAuthInitialized)
  const location = useLocation()

  if (!initialized) {
    return <LoadingSpinner label="Verifica sessione in corso..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
