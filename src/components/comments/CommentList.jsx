import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchComments,
  addComment,
  removeComment,
  selectCommentsForPost,
  selectCommentsStatusForPost,
} from '../../features/comments/commentsSlice'
import { selectUserById } from '../../features/users/usersSlice'
import { selectCurrentUser } from '../../features/auth/authSlice'
import CommentItem from './CommentItem'
import CommentForm from './CommentForm'
import LoadingSpinner from '../common/LoadingSpinner'

function CommentRow({ comment, currentUser, postId }) {
  const dispatch = useDispatch()
  const author = useSelector(selectUserById(comment.userId))
  const canDelete = currentUser.id === comment.userId

  return (
    <CommentItem
      comment={comment}
      author={author}
      canDelete={canDelete}
      onDelete={() => dispatch(removeComment({ id: comment.id, postId }))}
    />
  )
}

export default function CommentList({ postId }) {
  const dispatch = useDispatch()
  const comments = useSelector(selectCommentsForPost(postId))
  const status = useSelector(selectCommentsStatusForPost(postId))
  const currentUser = useSelector(selectCurrentUser)

  useEffect(() => {
    dispatch(fetchComments(postId))
  }, [dispatch, postId])

  const handleAddComment = (content) => {
    dispatch(addComment({ postId, userId: currentUser.id, content }))
  }

  return (
    <div className="mt-3 border-top pt-3">
      {status === 'loading' && comments.length === 0 ? (
        <LoadingSpinner label="Caricamento commenti..." />
      ) : (
        comments.map((comment) => (
          <CommentRow key={comment.id} comment={comment} currentUser={currentUser} postId={postId} />
        ))
      )}
      <CommentForm onSubmit={handleAddComment} />
    </div>
  )
}
