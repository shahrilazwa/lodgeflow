import { Link, Outlet } from 'react-router-dom'

/**
 * Layout wrapper for public auth routes.
 * Uses a restrained MYDS-inspired centered card layout.
 */
export default function PublicLayout() {
  return (
    <div className="auth-page">
      <style>{authLayoutStyles}</style>

      <header className="auth-header">
        <Link to="/" className="auth-brand" aria-label="Back to LodgeFlow home">
          <span className="auth-brand-mark">L</span>
          <span>LodgeFlow</span>
        </Link>
      </header>

      <main className="auth-main">
        <section className="auth-card" aria-label="Authentication form">
          <Outlet />
        </section>
      </main>
    </div>
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

  .auth-header {
    width: min(1120px, calc(100% - 32px));
    min-height: 72px;
    margin: 0 auto;
    display: flex;
    align-items: center;
  }

  .auth-brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: #18181b;
    font-size: 1rem;
    font-weight: 800;
    text-decoration: none;
  }

  .auth-brand-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: #eff6ff;
    color: #2563eb;
    font-weight: 900;
  }

  .auth-main {
    min-height: calc(100vh - 72px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 20px 72px;
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
    box-shadow: 0 1px 2px rgba(24, 24, 27, 0.04);
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

  @media (max-width: 640px) {
    .auth-header {
      min-height: 64px;
    }

    .auth-main {
      align-items: flex-start;
      min-height: calc(100vh - 64px);
      padding: 20px 12px 48px;
    }

    .auth-card {
      min-height: auto;
      padding: 32px 24px;
    }
  }
`