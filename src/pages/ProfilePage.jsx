import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import ProfileCard from '../components/profile/ProfileCard'
import ProfileEditForm from '../components/profile/ProfileEditForm'
import FollowListModal from '../components/profile/FollowListModal'
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
import {
  fetchFollowData,
  toggleFollow,
  selectFollowersCount,
  selectFollowingCount,
  selectIsFollowing,
  selectFollowerIds,
  selectFollowingIds,
} from '../features/follow/followSlice'
import { selectIsUserOnline } from '../features/presence/presenceSlice'

export default function ProfilePage() {
  const { id } = useParams()
  const userId = Number(id)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const profileUser = useSelector(selectUserById(userId))
  const usersStatus = useSelector(selectUsersStatus)
  const usersError = useSelector(selectUsersError)
  const posts = useSelector(selectPostsByUser(userId), shallowEqual)
  const postsStatus = useSelector(selectPostsByUserStatus(userId))
  const conversations = useSelector(selectConversations)
  const followersCount = useSelector(selectFollowersCount(userId))
  const followingCount = useSelector(selectFollowingCount(userId))
  const isFollowing = useSelector(selectIsFollowing(currentUser.id, userId))
  const isOnline = useSelector(selectIsUserOnline(userId))
  const followerIds = useSelector(selectFollowerIds(userId), shallowEqual)
  const followingIds = useSelector(selectFollowingIds(userId), shallowEqual)
  const [showEditForm, setShowEditForm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [followListMode, setFollowListMode] = useState(null)

  useEffect(() => {
    dispatch(fetchUserById(userId))
    dispatch(fetchAllUsers())
    dispatch(fetchPostsByUser(userId))
    dispatch(fetchConversations(currentUser.id))
    dispatch(fetchFollowData(userId))
  }, [dispatch, userId, currentUser.id])

  const isOwnProfile = currentUser.id === userId

  const handleToggleFollow = () => {
    dispatch(toggleFollow({ followerId: currentUser.id, followingId: userId }))
  }

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
    <Row>
      <Col lg={8} className="mx-auto">
        <ProfileCard
          user={profileUser}
          isOwnProfile={isOwnProfile}
          isOnline={isOnline}
          followersCount={followersCount}
          followingCount={followingCount}
          isFollowing={isFollowing}
          onEdit={() => setShowEditForm(true)}
          onMessage={handleMessage}
          onToggleFollow={handleToggleFollow}
          onShowFollowers={() => setFollowListMode('followers')}
          onShowFollowing={() => setFollowListMode('following')}
        />

        <FollowListModal
          show={followListMode !== null}
          onClose={() => setFollowListMode(null)}
          title={followListMode === 'followers' ? 'Follower' : 'Seguiti'}
          userIds={followListMode === 'followers' ? followerIds : followingIds}
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
      </Col>
    </Row>
  )
}
