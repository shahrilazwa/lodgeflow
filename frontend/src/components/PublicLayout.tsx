import { Outlet } from 'react-router-dom'

/**
 * Layout wrapper for public routes (login, register).
 * No sidebar or navigation — just centered content.
 */
export default function PublicLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <Outlet />
      </div>
    </div>
  )
}
