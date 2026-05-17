import { Link } from 'react-router-dom'

const features = [
  {
    title: 'Room Management',
    description: 'Set up properties, room types, unit numbers, capacity and availability in one structured workspace.',
  },
  {
    title: 'Booking Management',
    description: 'Record reservations, stay dates, guest details and booking status without jumping between spreadsheets.',
  },
  {
    title: 'Guest Records',
    description: 'Keep guest contact details, booking history and stay information easy to find when the front desk needs it.',
  },
  {
    title: 'Payment Tracking',
    description: 'Monitor deposits, outstanding balances, refunds and payment status for each booking.',
  },
  {
    title: 'Cleaning & Maintenance',
    description: 'Coordinate housekeeping after checkout and track maintenance tasks before they become guest issues.',
  },
  {
    title: 'Reports & Insights',
    description: 'Understand occupancy, income, expenses and daily operational workload from a simple dashboard.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Set up your property',
    description: 'Add your property, room types, room numbers and basic operating details.',
  },
  {
    number: '02',
    title: 'Create bookings',
    description: 'Record guest reservations with stay dates, room selection, payment status and booking notes.',
  },
  {
    number: '03',
    title: 'Run daily operations',
    description: 'Track arrivals, departures, occupied rooms, cleaning work and pending follow-ups from one place.',
  },
  {
    number: '04',
    title: 'Review performance',
    description: 'Use clear summaries to understand occupancy, revenue, expenses and operational trends.',
  },
]

const faqs = [
  {
    question: 'Who is LodgeFlow for?',
    answer: 'LodgeFlow is designed for small hotels, lodges, homestays, guesthouses and boutique accommodation operators.',
  },
  {
    question: 'Can I manage multiple rooms and room types?',
    answer: 'Yes. LodgeFlow is built around properties, units, room availability and booking status so daily operations stay organized.',
  },
  {
    question: 'Does LodgeFlow support payment tracking?',
    answer: 'Yes. You can track payment status, deposits, outstanding balances and refunds at booking level.',
  },
  {
    question: 'Is this only a landing page change?',
    answer: 'Yes. This page introduces the product clearly without changing authentication, booking logic, database structure or backend behavior.',
  },
]

export default function LandingPage() {
  return (
    <div className="lf-page">
      <style>{landingStyles}</style>

      <section className="lf-trust-strip" aria-label="LodgeFlow product summary">
        <div className="lf-container lf-trust-card">
          <div className="lf-trust-eyebrow">Built for small accommodation operators</div>
          <div className="lf-trust-grid">
            <div className="lf-trust-item">
              <span className="lf-trust-icon" aria-hidden="true">LF</span>
              <div>
                <h2>Simple booking operations</h2>
                <p>Manage rooms, guests, bookings and payments from one clean workspace.</p>
              </div>
            </div>
            <div className="lf-trust-item">
              <span className="lf-trust-icon" aria-hidden="true">24</span>
              <div>
                <h2>Designed for daily front-desk use</h2>
                <p>Readable screens for check-ins, booking status, occupancy and follow-up work.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <header className="lf-navbar-wrap">
        <div className="lf-container lf-navbar">
          <Link to="/" className="lf-brand" aria-label="LodgeFlow home">
            <span className="lf-brand-mark">L</span>
            <span>LodgeFlow</span>
          </Link>

          <nav className="lf-nav-links" aria-label="Primary navigation">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="lf-nav-actions">
            <Link to="/login" className="lf-link-button">Log in</Link>
            <Link to="/register" className="lf-primary-button lf-small-button">Get started</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="lf-hero">
          <div className="lf-container lf-hero-grid">
            <div className="lf-hero-copy">
              <div className="lf-badge">Property operations workspace</div>
              <h1>Property Management Made Simple</h1>
              <p className="lf-hero-description">
                Run bookings, rooms, guests, payments and daily operations from one clean system built for small accommodation businesses.
              </p>
              <div className="lf-hero-actions">
                <Link to="/register" className="lf-primary-button">Get started</Link>
                <Link to="/login" className="lf-secondary-button">View demo</Link>
              </div>
              <div className="lf-chip-row" aria-label="Key LodgeFlow capabilities">
                <span>Room availability tracking</span>
                <span>Guest records</span>
                <span>Booking status</span>
                <span>Payment monitoring</span>
              </div>
            </div>

            <div className="lf-preview-card" aria-label="LodgeFlow dashboard preview">
              <div className="lf-preview-header">
                <div>
                  <span className="lf-preview-kicker">Today</span>
                  <h2>Front Desk Overview</h2>
                </div>
                <span className="lf-status-pill">Live</span>
              </div>

              <div className="lf-stat-grid">
                <PreviewStat label="Occupancy" value="18 / 24" />
                <PreviewStat label="Check-ins" value="6" />
                <PreviewStat label="Check-outs" value="4" />
                <PreviewStat label="Pending payment" value="3" />
              </div>

              <div className="lf-booking-panel">
                <div className="lf-panel-title-row">
                  <h3>Booking queue</h3>
                  <span>Next 24 hours</span>
                </div>
                <PreviewBooking guest="Aina Rahman" room="Deluxe 02" status="Confirmed" />
                <PreviewBooking guest="Daniel Wong" room="Family 01" status="Checked in" />
                <PreviewBooking guest="Nur Iman" room="Studio 04" status="Pending payment" />
              </div>
            </div>
          </div>
        </section>

        <section className="lf-section lf-problem-section">
          <div className="lf-container lf-split-grid">
            <div>
              <div className="lf-section-label">Problem solved</div>
              <h2>Stop managing bookings across notebooks, WhatsApp and spreadsheets.</h2>
              <p>
                LodgeFlow centralizes daily accommodation operations so your team can see room availability, booking status, guest details and payment progress without switching between multiple tools.
              </p>
              <ul className="lf-check-list">
                <li>View booking status at a glance</li>
                <li>Track available, occupied and blocked rooms</li>
                <li>Keep guest information organized</li>
                <li>Reduce double-booking and manual follow-ups</li>
              </ul>
            </div>

            <div className="lf-soft-panel">
              <div className="lf-mini-window">
                <div className="lf-mini-window-header">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="lf-room-list">
                  <RoomRow room="Deluxe 01" state="Occupied" />
                  <RoomRow room="Deluxe 02" state="Reserved" />
                  <RoomRow room="Studio 03" state="Available" />
                  <RoomRow room="Family 01" state="Cleaning" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="lf-section">
          <div className="lf-container">
            <div className="lf-section-heading">
              <div className="lf-section-label">Features</div>
              <h2>Everything you need to run your lodging business</h2>
              <p>Focused modules for the work small accommodation teams do every day.</p>
            </div>

            <div className="lf-feature-grid">
              {features.map((feature) => (
                <article key={feature.title} className="lf-feature-card">
                  <div className="lf-feature-icon" aria-hidden="true">{feature.title.charAt(0)}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="lf-section lf-steps-section">
          <div className="lf-container">
            <div className="lf-section-heading">
              <div className="lf-section-label">How it works</div>
              <h2>From setup to daily operations in four clear steps</h2>
            </div>

            <div className="lf-step-grid">
              {steps.map((step) => (
                <article key={step.number} className="lf-step-card">
                  <span>{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="lf-section">
          <div className="lf-container lf-faq-grid">
            <div>
              <div className="lf-section-label">FAQ</div>
              <h2>Common questions</h2>
              <p>Simple answers before you start exploring LodgeFlow.</p>
            </div>
            <div className="lf-faq-list">
              {faqs.map((faq) => (
                <details key={faq.question} className="lf-faq-item">
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="lf-container lf-cta-card">
          <div>
            <div className="lf-section-label">Ready when you are</div>
            <h2>Ready to simplify your lodge operations?</h2>
            <p>Start managing bookings, rooms and guests from one clean workspace.</p>
          </div>
          <div className="lf-cta-actions">
            <Link to="/register" className="lf-primary-button">Get started</Link>
            <Link to="/login" className="lf-secondary-button">Log in</Link>
          </div>
        </section>
      </main>

      <footer className="lf-footer">
        <div className="lf-container lf-footer-inner">
          <span>LodgeFlow</span>
          <span>Property operations for small accommodation businesses.</span>
        </div>
      </footer>
    </div>
  )
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="lf-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function PreviewBooking({ guest, room, status }: { guest: string; room: string; status: string }) {
  return (
    <div className="lf-booking-row">
      <div>
        <strong>{guest}</strong>
        <span>{room}</span>
      </div>
      <em>{status}</em>
    </div>
  )
}

function RoomRow({ room, state }: { room: string; state: string }) {
  return (
    <div className="lf-room-row">
      <span>{room}</span>
      <strong>{state}</strong>
    </div>
  )
}

const landingStyles = `
  .lf-page {
    min-height: 100vh;
    background: #ffffff;
    color: #18181b;
  }

  .lf-page * {
    box-sizing: border-box;
  }

  .lf-container {
    width: min(1120px, calc(100% - 32px));
    margin: 0 auto;
  }

  .lf-trust-strip {
    padding: 24px 0 16px;
    background: #ffffff;
  }

  .lf-trust-card {
    border: 1px solid #e4e4e7;
    border-radius: 16px;
    padding: 28px 32px;
    background: #fafafa;
  }

  .lf-trust-eyebrow {
    margin-bottom: 18px;
    font-size: 0.78rem;
    font-weight: 700;
    color: #2563eb;
  }

  .lf-trust-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 32px;
  }

  .lf-trust-item {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 14px;
    align-items: start;
  }

  .lf-trust-icon,
  .lf-feature-icon,
  .lf-brand-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: #eff6ff;
    color: #2563eb;
    font-weight: 800;
  }

  .lf-trust-icon {
    width: 34px;
    height: 34px;
    font-size: 0.72rem;
  }

  .lf-trust-item h2 {
    margin: 0 0 6px;
    font-size: 0.95rem;
    line-height: 1.35;
  }

  .lf-trust-item p {
    margin: 0;
    color: #52525b;
    font-size: 0.85rem;
    line-height: 1.55;
  }

  .lf-navbar-wrap {
    position: sticky;
    top: 0;
    z-index: 10;
    background: rgba(255, 255, 255, 0.92);
    border-bottom: 1px solid #e4e4e7;
    backdrop-filter: blur(12px);
  }

  .lf-navbar {
    min-height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .lf-brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: #18181b;
    font-size: 1rem;
    font-weight: 800;
    text-decoration: none;
  }

  .lf-brand-mark {
    width: 32px;
    height: 32px;
  }

  .lf-nav-links,
  .lf-nav-actions,
  .lf-hero-actions,
  .lf-cta-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .lf-nav-links a,
  .lf-link-button {
    color: #3f3f46;
    font-size: 0.88rem;
    font-weight: 600;
    text-decoration: none;
  }

  .lf-nav-links a:hover,
  .lf-link-button:hover {
    color: #2563eb;
  }

  .lf-primary-button,
  .lf-secondary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 0 18px;
    border-radius: 10px;
    font-size: 0.92rem;
    font-weight: 700;
    text-decoration: none;
  }

  .lf-primary-button {
    border: 1px solid #2563eb;
    background: #2563eb;
    color: #ffffff;
  }

  .lf-secondary-button {
    border: 1px solid #d4d4d8;
    background: #ffffff;
    color: #18181b;
  }

  .lf-small-button {
    min-height: 38px;
    padding: 0 14px;
  }

  .lf-hero {
    padding: 76px 0;
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  }

  .lf-hero-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
    gap: 48px;
    align-items: center;
  }

  .lf-badge,
  .lf-section-label,
  .lf-preview-kicker {
    color: #2563eb;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.02em;
  }

  .lf-badge {
    display: inline-flex;
    margin-bottom: 18px;
    padding: 7px 10px;
    border: 1px solid #bfdbfe;
    border-radius: 999px;
    background: #eff6ff;
  }

  .lf-hero h1,
  .lf-section h2,
  .lf-cta-card h2 {
    margin: 0;
    color: #18181b;
    letter-spacing: -0.04em;
  }

  .lf-hero h1 {
    max-width: 640px;
    font-size: clamp(2.6rem, 6vw, 5.25rem);
    line-height: 0.95;
  }

  .lf-hero-description {
    max-width: 620px;
    margin: 22px 0 28px;
    color: #52525b;
    font-size: 1.1rem;
    line-height: 1.75;
  }

  .lf-chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 26px;
  }

  .lf-chip-row span {
    padding: 8px 12px;
    border: 1px solid #e4e4e7;
    border-radius: 999px;
    background: #ffffff;
    color: #3f3f46;
    font-size: 0.82rem;
    font-weight: 700;
  }

  .lf-preview-card,
  .lf-feature-card,
  .lf-step-card,
  .lf-faq-item,
  .lf-cta-card,
  .lf-soft-panel {
    border: 1px solid #e4e4e7;
    background: #ffffff;
    box-shadow: 0 1px 2px rgba(24, 24, 27, 0.04);
  }

  .lf-preview-card {
    border-radius: 24px;
    padding: 22px;
  }

  .lf-preview-header,
  .lf-panel-title-row,
  .lf-booking-row,
  .lf-room-row,
  .lf-footer-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .lf-preview-header h2 {
    margin: 4px 0 0;
    font-size: 1.15rem;
  }

  .lf-status-pill {
    padding: 6px 10px;
    border-radius: 999px;
    background: #ecfdf5;
    color: #047857;
    font-size: 0.75rem;
    font-weight: 800;
  }

  .lf-stat-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin: 22px 0;
  }

  .lf-stat-card {
    padding: 16px;
    border-radius: 16px;
    background: #f8fafc;
  }

  .lf-stat-card span,
  .lf-booking-row span,
  .lf-panel-title-row span,
  .lf-footer,
  .lf-section-heading p,
  .lf-section p,
  .lf-cta-card p,
  .lf-faq-item p {
    color: #71717a;
  }

  .lf-stat-card span {
    display: block;
    margin-bottom: 8px;
    font-size: 0.78rem;
    font-weight: 700;
  }

  .lf-stat-card strong {
    color: #18181b;
    font-size: 1.45rem;
  }

  .lf-booking-panel {
    padding: 16px;
    border-radius: 18px;
    background: #fafafa;
  }

  .lf-panel-title-row {
    margin-bottom: 12px;
  }

  .lf-panel-title-row h3 {
    margin: 0;
    font-size: 0.95rem;
  }

  .lf-panel-title-row span {
    font-size: 0.76rem;
    font-weight: 700;
  }

  .lf-booking-row {
    padding: 12px 0;
    border-top: 1px solid #e4e4e7;
  }

  .lf-booking-row strong,
  .lf-booking-row span {
    display: block;
  }

  .lf-booking-row strong {
    margin-bottom: 2px;
    font-size: 0.9rem;
  }

  .lf-booking-row span {
    font-size: 0.78rem;
  }

  .lf-booking-row em {
    color: #2563eb;
    font-size: 0.76rem;
    font-style: normal;
    font-weight: 800;
    white-space: nowrap;
  }

  .lf-section {
    padding: 76px 0;
  }

  .lf-problem-section,
  .lf-steps-section {
    background: #fafafa;
  }

  .lf-split-grid,
  .lf-faq-grid {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(360px, 1.1fr);
    gap: 48px;
    align-items: center;
  }

  .lf-section h2,
  .lf-cta-card h2 {
    margin-top: 8px;
    font-size: clamp(2rem, 4vw, 3.25rem);
    line-height: 1.05;
  }

  .lf-section p,
  .lf-cta-card p {
    font-size: 1rem;
    line-height: 1.7;
  }

  .lf-check-list {
    display: grid;
    gap: 10px;
    margin: 22px 0 0;
    padding: 0;
    list-style: none;
  }

  .lf-check-list li {
    position: relative;
    padding-left: 26px;
    color: #3f3f46;
    font-weight: 650;
  }

  .lf-check-list li::before {
    position: absolute;
    left: 0;
    top: 2px;
    content: '✓';
    color: #2563eb;
    font-weight: 900;
  }

  .lf-soft-panel {
    border-radius: 24px;
    padding: 28px;
    background: #f4f4f5;
  }

  .lf-mini-window {
    overflow: hidden;
    border: 1px solid #e4e4e7;
    border-radius: 18px;
    background: #ffffff;
  }

  .lf-mini-window-header {
    display: flex;
    gap: 7px;
    padding: 14px;
    border-bottom: 1px solid #e4e4e7;
  }

  .lf-mini-window-header span {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: #d4d4d8;
  }

  .lf-room-list {
    padding: 10px 18px 18px;
  }

  .lf-room-row {
    padding: 14px 0;
    border-bottom: 1px solid #f1f5f9;
    color: #52525b;
  }

  .lf-room-row:last-child {
    border-bottom: 0;
  }

  .lf-room-row strong {
    color: #18181b;
    font-size: 0.85rem;
  }

  .lf-section-heading {
    max-width: 680px;
    margin: 0 auto 34px;
    text-align: center;
  }

  .lf-feature-grid,
  .lf-step-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  .lf-feature-card,
  .lf-step-card {
    border-radius: 18px;
    padding: 24px;
  }

  .lf-feature-icon {
    width: 38px;
    height: 38px;
    margin-bottom: 18px;
  }

  .lf-feature-card h3,
  .lf-step-card h3 {
    margin: 0 0 10px;
    font-size: 1rem;
  }

  .lf-feature-card p,
  .lf-step-card p,
  .lf-faq-item p {
    margin: 0;
    font-size: 0.92rem;
  }

  .lf-step-card span {
    display: inline-block;
    margin-bottom: 26px;
    color: #2563eb;
    font-size: 0.82rem;
    font-weight: 900;
  }

  .lf-faq-grid {
    align-items: start;
  }

  .lf-faq-list {
    display: grid;
    gap: 12px;
  }

  .lf-faq-item {
    border-radius: 14px;
    padding: 0;
  }

  .lf-faq-item summary {
    cursor: pointer;
    padding: 18px 20px;
    color: #18181b;
    font-weight: 800;
  }

  .lf-faq-item p {
    padding: 0 20px 18px;
  }

  .lf-cta-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 76px;
    border-radius: 24px;
    padding: 34px;
    background: #fafafa;
  }

  .lf-cta-card h2 {
    font-size: clamp(1.8rem, 4vw, 2.75rem);
  }

  .lf-footer {
    padding: 28px 0;
    border-top: 1px solid #e4e4e7;
    background: #ffffff;
    font-size: 0.86rem;
  }

  .lf-footer span:first-child {
    color: #18181b;
    font-weight: 900;
  }

  @media (max-width: 900px) {
    .lf-trust-grid,
    .lf-hero-grid,
    .lf-split-grid,
    .lf-faq-grid {
      grid-template-columns: 1fr;
    }

    .lf-feature-grid,
    .lf-step-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .lf-nav-links {
      display: none;
    }
  }

  @media (max-width: 640px) {
    .lf-container {
      width: min(100% - 24px, 1120px);
    }

    .lf-trust-card,
    .lf-preview-card,
    .lf-soft-panel,
    .lf-cta-card {
      border-radius: 18px;
      padding: 20px;
    }

    .lf-navbar {
      align-items: flex-start;
      flex-direction: column;
      padding: 14px 0;
    }

    .lf-nav-actions,
    .lf-hero-actions,
    .lf-cta-actions {
      width: 100%;
      flex-wrap: wrap;
    }

    .lf-nav-actions a,
    .lf-hero-actions a,
    .lf-cta-actions a {
      flex: 1;
    }

    .lf-hero,
    .lf-section {
      padding: 52px 0;
    }

    .lf-stat-grid,
    .lf-feature-grid,
    .lf-step-grid {
      grid-template-columns: 1fr;
    }

    .lf-booking-row,
    .lf-room-row,
    .lf-footer-inner,
    .lf-cta-card {
      align-items: flex-start;
      flex-direction: column;
    }
  }
`