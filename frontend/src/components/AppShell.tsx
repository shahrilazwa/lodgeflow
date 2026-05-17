import { useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBed,
  faBuilding,
  faBroom,
  faCalendarCheck,
  faChartSimple,
  faCreditCard,
  faDoorClosed,
  faGear,
  faGrip,
  faReceipt,
  faTableColumns,
  faUser,
  faUsersGear,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { useAuth } from '@/features/auth/useAuth'

interface AppShellProps {
  children: ReactNode
}

const navItems: Array<{ to: string; label: string; icon: IconDefinition }> = [
  { to: '/dashboard', label: 'Dashboard', icon: faGrip },
  { to: '/properties', label: 'Properties', icon: faBuilding },
  { to: '/units', label: 'Units', icon: faBed },
  { to: '/guests', label: 'Guests', icon: faUser },
  { to: '/bookings', label: 'Bookings', icon: faCalendarCheck },
  { to: '/payments', label: 'Payments', icon: faCreditCard },
  { to: '/expenses', label: 'Expenses', icon: faReceipt },
  { to: '/service-providers', label: 'Service Providers', icon: faUsersGear },
  { to: '/cleaning-tasks', label: 'Cleaning Tasks', icon: faBroom },
  { to: '/maintenance-tasks', label: 'Maintenance Tasks', icon: faGear },
]

export default function AppShell({ children }: AppShellProps) {
  const { logout, owner } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const currentSection = getCurrentSection(location.pathname)

  function handleLogout() {
    logout()
    window.location.href = '/login'
  }

  return (
    <div className={`app-shell ${sidebarOpen ? '' : 'is-sidebar-collapsed'}`}>
      <style>{appShellStyles}</style>

      <aside className="app-sidebar" aria-label="Main navigation" aria-hidden={!sidebarOpen}>
        <div className="app-sidebar-brand">
          <span className="app-brand-mark">L</span>
          <span>LodgeFlow</span>
        </div>

        <nav className="app-nav">
          <p className="app-nav-label">Navigation</p>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `app-nav-link ${isActive ? 'is-active' : ''}`}>
              <FontAwesomeIcon icon={item.icon} className="app-nav-icon" aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="app-sidebar-footer">
          <div className="app-user-pill">{owner?.email ?? owner?.name ?? 'LodgeFlow user'}</div>
          <button type="button" onClick={handleLogout} className="app-logout-button">
            <FontAwesomeIcon icon={faDoorClosed} aria-hidden="true" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <div className="app-content">
        <header className="app-topbar">
          <button
            type="button"
            className="app-sidebar-toggle"
            aria-label={sidebarOpen ? 'Hide navigation menu' : 'Show navigation menu'}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((isOpen) => !isOpen)}
          >
            <FontAwesomeIcon icon={faTableColumns} aria-hidden="true" />
          </button>
          <div className="app-topbar-spacer" />
          <div className="app-topbar-context" aria-label="Current section">
            <FontAwesomeIcon icon={currentSection.icon} aria-hidden="true" />
            <span>{currentSection.label}</span>
          </div>
        </header>

        <main className="app-main">
          {children}
        </main>
      </div>
    </div>
  )
}

function getCurrentSection(pathname: string): { label: string; icon: IconDefinition } {
  if (pathname.startsWith('/properties/') && pathname.includes('/units')) {
    return { label: 'Units', icon: faBed }
  }

  if (pathname.startsWith('/units')) {
    return { label: 'Units', icon: faBed }
  }

  const directMatch = navItems.find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`))
  return directMatch ?? { label: 'Dashboard', icon: faChartSimple }
}

const appShellStyles = `
  .app-shell {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 286px 1fr;
    background: #ffffff;
    color: #18181b;
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 14px;
    line-height: 1.5;
    transition: grid-template-columns 260ms ease;
  }

  .app-shell * {
    box-sizing: border-box;
  }

  .app-shell.is-sidebar-collapsed {
    grid-template-columns: 0 1fr;
  }

  .app-sidebar {
    position: sticky;
    top: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #e4e4e7;
    background: #ffffff;
    overflow: hidden;
    transition: transform 260ms ease, opacity 220ms ease, border-color 220ms ease;
  }

  .app-shell.is-sidebar-collapsed .app-sidebar {
    transform: translateX(-100%);
    opacity: 0;
    border-color: transparent;
    pointer-events: none;
  }

  .app-sidebar-brand {
    min-height: 82px;
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 0 20px;
    border-bottom: 1px solid #e4e4e7;
    color: #18181b;
    font-size: 1.2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    white-space: nowrap;
  }

  .app-brand-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: #eff6ff;
    color: #2563eb;
    font-size: 0.86rem;
    font-weight: 800;
  }

  .app-nav {
    flex: 1;
    overflow-y: auto;
    padding: 18px 12px;
  }

  .app-nav-label {
    margin: 0 0 9px;
    padding: 0 10px;
    color: #71717a;
    font-size: 0.78rem;
    font-weight: 500;
  }

  .app-nav-link {
    min-height: 38px;
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 0 10px;
    border-radius: 10px;
    color: #18181b;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: background 160ms ease, color 160ms ease;
    white-space: nowrap;
  }

  .app-nav-link:hover {
    background: #f4f4f5;
    color: #2563eb;
  }

  .app-nav-link.is-active {
    background: #f4f4f5;
    color: #18181b;
    font-weight: 700;
  }

  .app-nav-icon {
    width: 18px;
    height: 18px;
    flex: 0 0 18px;
    color: currentColor;
    font-size: 0.86rem;
  }

  .app-sidebar-footer {
    padding: 16px 12px 20px;
    border-top: 1px solid #e4e4e7;
  }

  .app-user-pill {
    min-height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 9px;
    padding: 0 10px;
    border: 1px solid #d4d4d8;
    border-radius: 999px;
    color: #18181b;
    font-size: 0.78rem;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .app-logout-button {
    width: 100%;
    min-height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid #2563eb;
    border-radius: 10px;
    background: #2563eb;
    color: #ffffff;
    cursor: pointer;
    font: inherit;
    font-size: 0.875rem;
    font-weight: 700;
  }

  .app-logout-button:hover {
    background: #1d4ed8;
    border-color: #1d4ed8;
  }

  .app-content {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .app-topbar {
    min-height: 56px;
    display: flex;
    align-items: center;
    padding: 0 24px;
    border-bottom: 1px solid #e4e4e7;
    background: #ffffff;
  }

  .app-sidebar-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border: 0;
    border-radius: 9px;
    background: transparent;
    color: #18181b;
    cursor: pointer;
    font-size: 1rem;
    transition: background 160ms ease, color 160ms ease;
  }

  .app-sidebar-toggle:hover {
    background: #f4f4f5;
    color: #2563eb;
  }

  .app-topbar-spacer {
    flex: 1;
  }

  .app-topbar-context {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #52525b;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .app-main {
    min-width: 0;
    flex: 1;
    padding: 26px 28px;
    background: #fafafa;
  }

  @media (max-width: 900px) {
    .app-shell,
    .app-shell.is-sidebar-collapsed {
      grid-template-columns: 1fr;
    }

    .app-sidebar {
      position: relative;
      height: auto;
      transform: none;
      opacity: 1;
    }

    .app-shell.is-sidebar-collapsed .app-sidebar {
      max-height: 0;
      transform: translateY(-12px);
      opacity: 0;
    }

    .app-nav {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
    }

    .app-nav-label {
      grid-column: 1 / -1;
    }

    .app-sidebar-footer {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 12px;
      align-items: center;
    }

    .app-user-pill {
      margin-bottom: 0;
    }

    .app-logout-button {
      width: auto;
      padding: 0 18px;
    }

    .app-main {
      padding: 22px;
    }
  }

  @media (max-width: 640px) {
    .app-sidebar-brand {
      min-height: 72px;
      padding: 0 16px;
    }

    .app-nav {
      grid-template-columns: 1fr;
      padding: 14px 12px;
    }

    .app-sidebar-footer {
      grid-template-columns: 1fr;
    }

    .app-logout-button {
      width: 100%;
    }

    .app-topbar {
      padding: 0 12px;
    }

    .app-main {
      padding: 18px 12px;
    }
  }
`
