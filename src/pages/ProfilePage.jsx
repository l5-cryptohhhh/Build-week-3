import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import ProfileCard from '../components/profile/ProfileCard'
import ProfileEditForm from '../components/profile/ProfileEditForm'
import PostCard from '../components/posts/PostCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorAlert from '../components/common/ErrorAlert'
import EmptyState from '../components/common/EmptyState'
import {
  fetchUserById,
  fetchAllUsers,
  updateProfile,
  selectUserById,
  selectUsersStatus,
  selectUsersError,
} from '../features/users/usersSlice'
import { selectCurrentUser } from '../features/auth/authSlice'
import {
  fetchPostsByUser,
  selectPostsByUser,
  selectPostsByUserStatus,
} from '../features/posts/postsSlice'
import {
  fetchConversations,
  startConversation,
  selectConversations,
} from '../features/messages/messagesSlice'

export default function ProfilePage() {
  const { id } = useParams()
  const userId = Number(id)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const profileUser = useSelector(selectUserById(userId))
  const usersStatus = useSelector(selectUsersStatus)
  const usersError = useSelector(selectUsersError)
  const posts = useSelector(selectPostsByUser(userId))
  const postsStatus = useSelector(selectPostsByUserStatus(userId))
  const conversations = useSelector(selectConversations)
  const [showEditForm, setShowEditForm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    dispatch(fetchUserById(userId))
    dispatch(fetchAllUsers())
    dispatch(fetchPostsByUser(userId))
    dispatch(fetchConversations(currentUser.id))
  }, [dispatch, userId, currentUser.id])

  const isOwnProfile = currentUser.id === userId

  const handleSaveProfile = async (changes) => {
    setIsSaving(true)
    await dispatch(updateProfile({ id: userId, changes }))
    setIsSaving(false)
    setShowEditForm(false)
  }

  const handleMessage = async () => {
    const existing = conversations.find(
      (conversation) =>
        (conversation.participant1Id === userId && conversation.participant2Id === currentUser.id) ||
        (conversation.participant1Id === currentUser.id && conversation.participant2Id === userId),
    )
    if (existing) {
      navigate(`/messages/${existing.id}`)
      return
    }
    const result = await dispatch(
      startConversation({ participant1Id: currentUser.id, participant2Id: userId }),
    )
    if (startConversation.fulfilled.match(result)) {
      navigate(`/messages/${result.payload.id}`)
    }
  }

  if (usersStatus === 'loading' && !profileUser) {
    return <LoadingSpinner label="Caricamento profilo..." />
  }

  if (!profileUser) {
    return <ErrorAlert message={usersError || 'Utente non trovato.'} />
  }

  return (
    <div>
      <ProfileCard
        user={profileUser}
        isOwnProfile={isOwnProfile}
        onEdit={() => setShowEditForm(true)}
        onMessage={handleMessage}
      />

      <h2 className="h5 mb-3">Post di {profileUser.fullName}</h2>
      {postsStatus === 'loading' && posts.length === 0 && (
        <LoadingSpinner label="Caricamento post..." />
      )}
      {postsStatus === 'succeeded' && posts.length === 0 && (
        <EmptyState icon="bi-journal-text" title="Nessun post pubblicato" />
      )}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {isOwnProfile && (
        <ProfileEditForm
          show={showEditForm}
          user={profileUser}
          onClose={() => setShowEditForm(false)}
          onSave={handleSaveProfile}
          isSaving={isSaving}
        />
      )}
    </div>
  )
}
