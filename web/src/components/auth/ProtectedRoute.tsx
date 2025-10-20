import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth.store'

type Props = {
  children: ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const token = useAuthStore(s => s.token)
  const location = useLocation()

  if (!token) {
    const from = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?from=${from}`} replace />
  }

  return <>{children}</>
}
