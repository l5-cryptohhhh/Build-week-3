import { useEffect } from 'react'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import Button from 'react-bootstrap/Button'
import {
  fetchComments,
  addComment,
  editComment,
  removeComment,
  selectCommentsForPost,
  selectCommentsStatusForPost,
  selectCommentsPageForPost,
  selectCommentsTotalForPost,
} from '../../features/comments/commentsSlice'
import { selectUserById } from '../../features/users/usersSlice'
import { selectCurrentUser } from '../../features/auth/authSlice'
import CommentItem from './CommentItem'
import CommentForm from './CommentForm'
import RowSkeleton from '../common/RowSkeleton'
import { requestConfirm } from '../../utils/confirm'

function CommentRow({ comment, currentUser, postId }) {
  const dispatch = useDispatch()
  const author = useSelector(selectUserById(comment.userId))
  const isOwn = currentUser.id === comment.userId

  const handleDelete = async () => {
    const confirmed = await requestConfirm({
      title: 'Eliminare il commento',
      message: 'Eliminare questo commento?',
      confirmLabel: 'Elimina',
    })
    if (confirmed) dispatch(removeComment({ id: comment.id, postId }))
  }

  return (
    <CommentItem
      comment={comment}
      author={author}
      canEdit={isOwn}
      canDelete={isOwn}
      onEdit={(content) => dispatch(editComment({ id: comment.id, postId, content }))}
      onDelete={handleDelete}
    />
  )
}

export default function CommentList({ postId }) {
  const dispatch = useDispatch()
  const comments = useSelector(selectCommentsForPost(postId), shallowEqual)
  const status = useSelector(selectCommentsStatusForPost(postId))
  const page = useSelector(selectCommentsPageForPost(postId))
  const totalCount = useSelector(selectCommentsTotalForPost(postId))
  const currentUser = useSelector(selectCurrentUser)

  useEffect(() => {
    dispatch(fetchComments({ postId, page: 1 }))
  }, [dispatch, postId])

  const handleAddComment = (content) => {
    dispatch(addComment({ postId, userId: currentUser.id, content }))
  }

  const hasMore = comments.length < totalCount

  return (
    <div className="mt-3 border-top pt-3">
      {status === 'loading' && comments.length === 0 ? (
        <>
          <RowSkeleton />
          <RowSkeleton />
        </>
      ) : (
        comments.map((comment) => (
          <CommentRow key={comment.id} comment={comment} currentUser={currentUser} postId={postId} />
        ))
      )}
      {hasMore && (
        <div className="text-center mb-2">
          <Button
            size="sm"
            variant="outline-secondary"
            disabled={status === 'loading'}
            onClick={() => dispatch(fetchComments({ postId, page: page + 1 }))}
          >
            {status === 'loading' ? 'Caricamento...' : 'Carica altri commenti'}
          </Button>
        </div>
      )}
      <CommentForm onSubmit={handleAddComment} />
    </div>
  )
}
