import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import postsReducer from '../features/posts/postsSlice'
import usersReducer from '../features/users/usersSlice'
import commentsReducer from '../features/comments/commentsSlice'
import messagesReducer from '../features/messages/messagesSlice'
import notificationsReducer from '../features/notifications/notificationsSlice'
import searchReducer from '../features/search/searchSlice'
import followReducer from '../features/follow/followSlice'
import presenceReducer from '../features/presence/presenceSlice'
import { toastMiddleware } from './toastMiddleware'
import { loadingBarMiddleware } from './loadingBarMiddleware'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    users: usersReducer,
    comments: commentsReducer,
    messages: messagesReducer,
    notifications: notificationsReducer,
    search: searchReducer,
    follow: followReducer,
    presence: presenceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(toastMiddleware, loadingBarMiddleware),
})
