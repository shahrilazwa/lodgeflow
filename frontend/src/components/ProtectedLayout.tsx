import { Navigate, Outlet } from 'react-router-dom'
import { hasAuthToken } from '@/lib/api'
import AppShell from './AppShell'

/**
 * Layout wrapper for protected routes.
 * Redirects to /login if no auth token is present.
 */
export default function ProtectedLayout() {
  if (!hasAuthToken()) {
    return <Navigate to="/login" replace />
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
