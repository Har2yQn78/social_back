import { createBrowserRouter } from 'react-router-dom'
import App from './App'

// pages
import RegisterPage from './pages/RegisterPage'
import ActivatePage from './pages/ActivatePage'
import LoginPage from './pages/LoginPage'
import FeedPage from './pages/FeedPage'
import PostDetailPage from './pages/PostDetailPage'
import PostCreatePage from './pages/PostCreatePage'
import PostEditPage from './pages/PostEditPage'
import UserProfilePage from './pages/UserProfilePage'
import FollowersPage from './pages/FollowersPage'
import FollowingPage from './pages/FollowingPage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <FeedPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'activate/:token', element: <ActivatePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'feed', element: <FeedPage /> },
      { path: 'post/create', element: <PostCreatePage /> },
      { path: 'post/:id', element: <PostDetailPage /> },
      { path: 'post/:id/edit', element: <PostEditPage /> },
      { path: 'user/:id', element: <UserProfilePage /> },
      { path: 'user/:id/followers', element: <FollowersPage /> },
      { path: 'user/:id/following', element: <FollowingPage /> },
      { path: 'settings', element: <SettingsPage /> }
    ],
    errorElement: <NotFoundPage />
  }
])
