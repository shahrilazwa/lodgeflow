import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'

/**
 * Layout wrapper for public auth routes.
 * Uses a restrained MYDS-inspired masthead, header and centered auth card layout.
 */
export default function PublicLayout() {
  const [mastheadOpen, setMastheadOpen] = useState(false)

  return (
    <div className="auth-page">
      <style>{authLayoutStyles}</style>

      <section className="auth-masthead" aria-label="LodgeFlow information masthead">
        <div className="auth-container auth-masthead-summary">
          <span className="auth-masthead-logo" aria-hidden="true">L</span>
          <span className="auth-masthead-title">LodgeFlow</span>
          <button
            type="button"
            className="auth-masthead-toggle"
            aria-expanded={mastheadOpen}
            aria-controls="auth-masthead-panel"
            onClick={() => setMastheadOpen((isOpen) => !isOpen)}
          >
            <span>Ketahui Lebih Lanjut</span>
            <ChevronIcon />
          </button>
        </div>

        <div
          id="auth-masthead-panel"
          className={`auth-masthead-panel ${mastheadOpen ? 'is-open' : ''}`}
          aria-hidden={!mastheadOpen}
        >
          <div className="auth-container">
            <div className="auth-masthead-card">
              <div className="auth-masthead-item">
                <BuildingIcon />
                <div>
                  <h2>Built for small accommodation operations</h2>
                  <p>LodgeFlow helps small hotels, lodges, homestays and guesthouses manage daily booking work from one place.</p>
                </div>
              </div>
              <div className="auth-masthead-item">
                <ShieldIcon />
                <div>
                  <h2>Clean, secure and staff-friendly workflow</h2>
                  <p>Use clear screens for room availability, guest records, booking status, payments, cleaning and maintenance follow-ups.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <header className="auth-header-wrap">
        <div className="auth-container auth-header">
          <Link to="/" className="auth-brand" aria-label="Back to LodgeFlow home">
            <span>LodgeFlow</span>
          </Link>

          <Link to="/" className="auth-back-link" aria-label="Back to homepage">
            <span aria-hidden="true">←</span>
            <span>Back to home</span>
          </Link>
        </div>
      </header>

      <main className="auth-main">
        <section className="auth-card" aria-label="Authentication form">
          <Outlet />
        </section>
      </main>
    </div>
  )
}

function ChevronIcon() {
  return (
    <svg className="auth-chevron-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 10.5 8 6l4 4.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg className="auth-masthead-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20h16M6 20V8.5L12 5l6 3.5V20M9 20v-5h6v5M9 11h.01M12 11h.01M15 11h.01" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg className="auth-masthead-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.5 18 6v5.2c0 3.8-2.4 7.2-6 8.3-3.6-1.1-6-4.5-6-8.3V6l6-2.5Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
      <path d="m9.5 12.2 1.7 1.7 3.6-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  )
}

const authLayoutStyles = `
  .auth-page {
    min-height: 100vh;
    background: #ffffff;
    color: #18181b;
  }

  .auth-page * {
    box-sizing: border-box;
  }

  .auth-container {
    width: min(1120px, calc(100% - 32px));
    margin: 0 auto;
  }

  .auth-masthead {
    border-bottom: 1px solid #e4e4e7;
    background: #ffffff;
  }

  .auth-masthead-summary {
    min-height: 44px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.88rem;
  }

  .auth-masthead-logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 8px;
    background: #eff6ff;
    color: #2563eb;
    font-weight: 900;
    line-height: 1;
  }

  .auth-masthead-title {
    color: #18181b;
    font-weight: 700;
    line-height: 1;
  }

  .auth-masthead-toggle {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 0;
    border: 0;
    background: transparent;
    color: #2563eb;
    cursor: pointer;
    font: inherit;
    font-weight: 700;
    line-height: 1;
  }

  .auth-masthead-toggle:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .auth-chevron-icon {
    width: 14px;
    height: 14px;
    flex: 0 0 14px;
    transform: rotate(180deg);
    transition: transform 220ms ease;
  }

  .auth-masthead-toggle[aria-expanded='true'] .auth-chevron-icon {
    transform: rotate(0deg);
  }

  .auth-masthead-panel {
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transform: translateY(-6px);
    transition: max-height 360ms ease, opacity 220ms ease, transform 300ms ease;
  }

  .auth-masthead-panel.is-open {
    max-height: 260px;
    opacity: 1;
    transform: translateY(0);
  }

  .auth-masthead-card {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 48px;
    margin: 4px 0 28px;
    padding: 28px 32px;
    border-radius: 14px;
    background: #f4f4f5;
  }

  .auth-masthead-item {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 16px;
    align-items: start;
  }

  .auth-masthead-icon {
    width: 30px;
    height: 30px;
    color: #71717a;
  }

  .auth-masthead-item h2 {
    margin: 0 0 6px;
    font-size: 0.95rem;
    line-height: 1.35;
  }

  .auth-masthead-item p {
    margin: 0;
    color: #52525b;
    font-size: 0.85rem;
    line-height: 1.55;
  }

  .auth-header-wrap {
    border-bottom: 1px solid #e4e4e7;
    background: #ffffff;
  }

  .auth-header {
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .auth-brand {
    display: inline-flex;
    align-items: center;
    color: #18181b;
    font-size: 1.45rem;
    font-weight: 900;
    letter-spacing: -0.03em;
    text-decoration: none;
  }

  .auth-back-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 38px;
    padding: 0 14px;
    border: 1px solid #d4d4d8;
    border-radius: 10px;
    background: #ffffff;
    color: #18181b;
    font-size: 0.88rem;
    font-weight: 700;
    text-decoration: none;
    box-shadow: 0 1px 2px rgba(24, 24, 27, 0.04);
  }

  .auth-back-link:hover {
    border-color: #2563eb;
    color: #2563eb;
  }

  .auth-main {
    min-height: calc(100vh - 125px);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 56px 20px 72px;
    background:
      radial-gradient(circle at 1px 1px, #e4e4e7 1px, transparent 0),
      linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
    background-size: 36px 36px, auto;
  }

  .auth-card {
    width: min(100%, 430px);
    min-height: 560px;
    display: flex;
    align-items: center;
    border: 1px solid #e4e4e7;
    border-radius: 16px;
    background: #ffffff;
    box-shadow: 0 1px 3px rgba(24, 24, 27, 0.08);
    padding: 42px 36px;
  }

  .auth-card > * {
    width: 100%;
  }

  .auth-title {
    margin: 0 0 10px;
    text-align: center;
    color: #18181b;
    font-size: 1.45rem;
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  .auth-subtitle {
    margin: 0 0 28px;
    text-align: center;
    color: #52525b;
    font-size: 0.92rem;
    line-height: 1.55;
  }

  .auth-alert {
    margin-bottom: 18px;
    padding: 12px 14px;
    border: 1px solid #fecaca;
    border-radius: 10px;
    background: #fef2f2;
    color: #991b1b;
    font-size: 0.85rem;
  }

  .auth-field {
    margin-bottom: 16px;
  }

  .auth-label {
    display: block;
    margin-bottom: 7px;
    color: #52525b;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .auth-input {
    width: 100%;
    min-height: 44px;
    padding: 0 13px;
    border: 1px solid #d4d4d8;
    border-radius: 8px;
    background: #ffffff;
    color: #18181b;
    font: inherit;
    font-size: 0.92rem;
    outline: none;
    box-shadow: 0 1px 2px rgba(24, 24, 27, 0.04);
    transition: border-color 160ms ease, box-shadow 160ms ease;
  }

  .auth-input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18);
  }

  .auth-error {
    margin: 6px 0 0;
    color: #dc2626;
    font-size: 0.8rem;
  }

  .auth-submit {
    width: 100%;
    min-height: 44px;
    margin-top: 8px;
    border: 1px solid #2563eb;
    border-radius: 8px;
    background: #2563eb;
    color: #ffffff;
    cursor: pointer;
    font: inherit;
    font-size: 0.92rem;
    font-weight: 800;
    transition: background 160ms ease, border-color 160ms ease, opacity 160ms ease;
  }

  .auth-submit:hover:not(:disabled) {
    background: #1d4ed8;
    border-color: #1d4ed8;
  }

  .auth-submit:disabled {
    cursor: not-allowed;
    opacity: 0.72;
  }

  .auth-helper {
    margin: 22px 0 0;
    text-align: center;
    color: #71717a;
    font-size: 0.82rem;
  }

  .auth-link {
    color: #2563eb;
    font-weight: 800;
    text-decoration: none;
  }

  .auth-link:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  @media (max-width: 900px) {
    .auth-masthead-card {
      grid-template-columns: 1fr;
    }

    .auth-masthead-panel.is-open {
      max-height: 360px;
    }
  }

  @media (max-width: 640px) {
    .auth-container {
      width: min(100% - 24px, 1120px);
    }

    .auth-masthead-summary {
      align-items: center;
      flex-wrap: wrap;
      padding: 12px 0;
    }

    .auth-masthead-card,
    .auth-card {
      border-radius: 18px;
      padding: 22px;
    }

    .auth-masthead-panel.is-open {
      max-height: 520px;
    }

    .auth-header {
      min-height: 72px;
    }

    .auth-brand {
      font-size: 1.25rem;
    }

    .auth-back-link span:last-child {
      display: none;
    }

    .auth-main {
      min-height: auto;
      padding: 36px 12px 48px;
    }

    .auth-card {
      min-height: auto;
      padding: 32px 24px;
    }
  }
`