import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import postsReducer from '../features/posts/postsSlice'
import usersReducer from '../features/users/usersSlice'
import commentsReducer from '../features/comments/commentsSlice'
import messagesReducer from '../features/messages/messagesSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    users: usersReducer,
    comments: commentsReducer,
    messages: messagesReducer,
  },
})
