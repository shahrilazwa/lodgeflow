import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'

interface AppShellProps {
  children: ReactNode
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '□' },
  { to: '/properties', label: 'Properties', icon: '⌂' },
  { to: '/units', label: 'Units', icon: '☰' },
  { to: '/guests', label: 'Guests', icon: '○' },
  { to: '/bookings', label: 'Bookings', icon: '✓' },
  { to: '/payments', label: 'Payments', icon: '₵' },
  { to: '/expenses', label: 'Expenses', icon: '▤' },
  { to: '/service-providers', label: 'Service Providers', icon: '◱' },
  { to: '/cleaning-tasks', label: 'Cleaning Tasks', icon: '✦' },
  { to: '/maintenance-tasks', label: 'Maintenance Tasks', icon: '⚙' },
]

export default function AppShell({ children }: AppShellProps) {
  const { logout, owner } = useAuth()

  function handleLogout() {
    logout()
    window.location.href = '/login'
  }

  return (
    <div className="app-shell">
      <style>{appShellStyles}</style>

      <aside className="app-sidebar" aria-label="Main navigation">
        <div className="app-sidebar-brand">
          <span className="app-brand-mark">L</span>
          <span>LodgeFlow</span>
        </div>

        <nav className="app-nav">
          <p className="app-nav-label">Navigation</p>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `app-nav-link ${isActive ? 'is-active' : ''}`}>
              <span className="app-nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="app-sidebar-footer">
          <div className="app-user-pill">{owner?.email ?? owner?.name ?? 'LodgeFlow user'}</div>
          <button type="button" onClick={handleLogout} className="app-logout-button">Log out</button>
        </div>
      </aside>

      <main className="app-main">
        {children}
      </main>
    </div>
  )
}

const appShellStyles = `
  .app-shell { min-height: 100vh; display: grid; grid-template-columns: 316px 1fr; background: #ffffff; color: #18181b; }
  .app-shell * { box-sizing: border-box; }
  .app-sidebar { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; border-right: 1px solid #e4e4e7; background: #ffffff; }
  .app-sidebar-brand { min-height: 96px; display: flex; align-items: center; gap: 12px; padding: 0 24px; border-bottom: 1px solid #e4e4e7; color: #18181b; font-size: 1.5rem; font-weight: 900; letter-spacing: -0.03em; }
  .app-brand-mark { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 12px; background: #eff6ff; color: #2563eb; font-size: 1rem; font-weight: 900; }
  .app-nav { flex: 1; overflow-y: auto; padding: 22px 16px; }
  .app-nav-label { margin: 0 0 10px; padding: 0 10px; color: #71717a; font-size: 0.82rem; font-weight: 700; }
  .app-nav-link { min-height: 44px; display: flex; align-items: center; gap: 12px; padding: 0 12px; border-radius: 12px; color: #18181b; text-decoration: none; font-size: 0.95rem; font-weight: 650; transition: background 160ms ease, color 160ms ease; }
  .app-nav-link:hover { background: #f4f4f5; color: #2563eb; }
  .app-nav-link.is-active { background: #f4f4f5; color: #18181b; font-weight: 800; }
  .app-nav-icon { width: 22px; height: 22px; flex: 0 0 22px; display: inline-flex; align-items: center; justify-content: center; color: currentColor; font-size: 1rem; }
  .app-sidebar-footer { padding: 20px 16px 24px; border-top: 1px solid #e4e4e7; }
  .app-user-pill { min-height: 34px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; padding: 0 12px; border: 1px solid #d4d4d8; border-radius: 999px; color: #18181b; font-size: 0.85rem; font-weight: 650; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .app-logout-button { width: 100%; min-height: 42px; border: 1px solid #2563eb; border-radius: 10px; background: #2563eb; color: #ffffff; cursor: pointer; font: inherit; font-size: 0.95rem; font-weight: 800; }
  .app-logout-button:hover { background: #1d4ed8; border-color: #1d4ed8; }
  .app-main { min-width: 0; padding: 32px; background: #fafafa; }
  @media (max-width: 900px) { .app-shell { grid-template-columns: 1fr; } .app-sidebar { position: relative; height: auto; } .app-nav { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; } .app-nav-label { grid-column: 1 / -1; } .app-sidebar-footer { display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: center; } .app-user-pill { margin-bottom: 0; } .app-logout-button { width: auto; padding: 0 18px; } .app-main { padding: 24px; } }
  @media (max-width: 640px) { .app-sidebar-brand { min-height: 76px; padding: 0 16px; } .app-nav { grid-template-columns: 1fr; padding: 16px 12px; } .app-sidebar-footer { grid-template-columns: 1fr; } .app-logout-button { width: 100%; } .app-main { padding: 18px 12px; } }
`
