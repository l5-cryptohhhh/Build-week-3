import { Routes, Route } from 'react-router-dom'
import PublicRoute from './PublicRoute'
import ProtectedRoute from './ProtectedRoute'
import MainLayout from '../components/layout/MainLayout'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import FeedPage from '../pages/FeedPage'
import ProfilePage from '../pages/ProfilePage'
import MessagesPage from '../pages/MessagesPage'
import SearchPage from '../pages/SearchPage'
import SavedPostsPage from '../pages/SavedPostsPage'
import JobsPage from '../pages/JobsPage'
import NotFoundPage from '../pages/NotFoundPage'

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<FeedPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:conversationId" element={<MessagesPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/saved" element={<SavedPostsPage />} />
          <Route path="/jobs" element={<JobsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
