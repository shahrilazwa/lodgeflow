import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'

interface AppShellProps {
  children: ReactNode
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/properties', label: 'Properties' },
  { to: '/units', label: 'Units' },
  { to: '/guests', label: 'Guests' },
  { to: '/bookings', label: 'Bookings' },
  { to: '/payments', label: 'Payments' },
  { to: '/expenses', label: 'Expenses' },
  { to: '/service-providers', label: 'Service Providers' },
  { to: '/cleaning-tasks', label: 'Cleaning Tasks' },
  { to: '/maintenance-tasks', label: 'Maintenance Tasks' },
]

/**
 * App shell with sidebar navigation and header.
 * Uses inline styles for now — will be replaced with MYDS components as screens are built.
 */
export default function AppShell({ children }: AppShellProps) {
  const { logout, owner } = useAuth()

  function handleLogout() {
    logout()
    window.location.href = '/login'
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '240px',
          backgroundColor: '#1a1a2e',
          color: '#ffffff',
          padding: '1rem 0',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '0 1rem 1.5rem', borderBottom: '1px solid #333' }}>
          <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>LodgeFlow</h1>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'block',
                padding: '0.5rem 1rem',
                color: isActive ? '#ffffff' : '#aaaaaa',
                backgroundColor: isActive ? '#16213e' : 'transparent',
                textDecoration: 'none',
                fontSize: '0.875rem',
                borderLeft: isActive ? '3px solid #4fc3f7' : '3px solid transparent',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid #333' }}>
          {owner && (
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: '#aaa' }}>{owner.name}</p>
          )}
          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: 'transparent',
              color: '#aaaaaa',
              border: '1px solid #555',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '2rem', backgroundColor: '#f8f9fa' }}>
        {children}
      </main>
    </div>
  )
}
