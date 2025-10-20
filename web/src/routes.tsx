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

// auth
import ProtectedRoute from './components/auth/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <FeedPage />
          </ProtectedRoute>
        )
      },

      { path: 'register', element: <RegisterPage /> },
      { path: 'activate/:token', element: <ActivatePage /> },
      { path: 'login', element: <LoginPage /> },

      {
        path: 'feed',
        element: (
          <ProtectedRoute>
            <FeedPage />
          </ProtectedRoute>
        )
      },
      // create/edit require auth
      {
        path: 'post/create',
        element: (
          <ProtectedRoute>
            <PostCreatePage />
          </ProtectedRoute>
        )
      },
      {
        path: 'post/:id/edit',
        element: (
          <ProtectedRoute>
            <PostEditPage />
          </ProtectedRoute>
        )
      },

      // reading a post can be public
      { path: 'post/:id', element: <PostDetailPage /> },

      // user profiles can be public
      { path: 'user/:id', element: <UserProfilePage /> },
      { path: 'user/:id/followers', element: <FollowersPage /> },
      { path: 'user/:id/following', element: <FollowingPage /> },

      // settings require auth
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        )
      }
    ],
    errorElement: <NotFoundPage />
  }
])
