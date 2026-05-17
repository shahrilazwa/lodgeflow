import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  const [bannerExpanded, setBannerExpanded] = useState(false)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Trust/Info Banner */}
      <div style={bannerStyle}>
        <div style={bannerInnerStyle}>
          <span style={bannerTextStyle}>
            LodgeFlow helps small lodging owners manage daily operations in one place.
          </span>
          <button
            type="button"
            onClick={() => setBannerExpanded(!bannerExpanded)}
            style={bannerToggleStyle}
          >
            {bannerExpanded ? 'Close ✕' : 'Learn more ▸'}
          </button>
        </div>
        {bannerExpanded && (
          <div style={bannerExpandedStyle}>
            <div style={bannerExpandedInnerStyle}>
              <p style={bannerExpandedTitleStyle}>What can you do with LodgeFlow?</p>
              <ul style={bannerListStyle}>
                <li>Manage bookings and guest records across multiple properties</li>
                <li>Track payments, refunds, and outstanding balances</li>
                <li>Record and categorise business expenses</li>
                <li>Coordinate cleaning tasks automatically after checkout</li>
                <li>Track maintenance work with priorities and scheduling</li>
                <li>View monthly income, expenses, and net profit on a dashboard</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Header */}
      <header style={headerStyle}>
        <div style={headerInnerStyle}>
          <Link to="/" style={logoLinkStyle}>
            <span style={logoTextStyle}>LodgeFlow</span>
          </Link>
          <nav style={navStyle}>
            <Link to="/login" style={navLinkStyle}>Login</Link>
            <Link to="/register" style={navBtnStyle}>Register</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main style={heroStyle}>
        <div style={heroContentStyle}>
          <h1 style={heroTitleStyle}>LodgeFlow</h1>
          <p style={heroTaglineStyle}>
            Property operations for small lodging businesses
          </p>
          <p style={heroDescStyle}>
            Manage bookings, guests, payments, expenses, cleaning, maintenance, and dashboard reporting in one place.
          </p>
          <div style={heroCTAStyle}>
            <Link to="/login" style={primaryBtnStyle}>Login</Link>
            <Link to="/register" style={secondaryBtnStyle}>Create Account</Link>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section style={featuresSectionStyle}>
        <div style={featuresInnerStyle}>
          <h2 style={featuresTitleStyle}>Everything you need to run your lodging business</h2>
          <div style={featuresGridStyle}>
            <FeatureCard icon="🏠" title="Properties & Units" desc="Manage multiple properties and rooms with activation controls." />
            <FeatureCard icon="👥" title="Guests & Bookings" desc="Record guests, create bookings, and manage check-in/check-out." />
            <FeatureCard icon="💰" title="Payments & Refunds" desc="Track payments, refunds, and outstanding balances per booking." />
            <FeatureCard icon="📝" title="Expenses & Providers" desc="Categorise expenses and link them to properties and vendors." />
            <FeatureCard icon="🧹" title="Cleaning & Maintenance" desc="Auto-create cleaning tasks on checkout. Track repairs." />
            <FeatureCard icon="📊" title="Dashboard Insights" desc="Monthly income, expenses, net profit, and pending tasks at a glance." />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={footerStyle}>
        <p style={footerTextStyle}>LodgeFlow — Built for homestay and lodging owners in Malaysia</p>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={featureCardStyle}>
      <span style={featureCardIconStyle}>{icon}</span>
      <h3 style={featureCardTitleStyle}>{title}</h3>
      <p style={featureCardDescStyle}>{desc}</p>
    </div>
  )
}

// --- Banner Styles ---
const bannerStyle: React.CSSProperties = { backgroundColor: '#1a1a2e', color: '#fff' }
const bannerInnerStyle: React.CSSProperties = { maxWidth: '1100px', margin: '0 auto', padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }
const bannerTextStyle: React.CSSProperties = { fontSize: '0.8rem', color: '#d0d0e0' }
const bannerToggleStyle: React.CSSProperties = { background: 'none', border: '1px solid #555', color: '#ccc', padding: '0.25rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', whiteSpace: 'nowrap' }
const bannerExpandedStyle: React.CSSProperties = { backgroundColor: '#16213e', borderTop: '1px solid #2a2a4e' }
const bannerExpandedInnerStyle: React.CSSProperties = { maxWidth: '1100px', margin: '0 auto', padding: '1rem 1.5rem' }
const bannerExpandedTitleStyle: React.CSSProperties = { margin: '0 0 0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#e0e0f0' }
const bannerListStyle: React.CSSProperties = { margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#b0b0c8', lineHeight: 1.8 }

// --- Header Styles ---
const headerStyle: React.CSSProperties = { borderBottom: '1px solid #eee', backgroundColor: '#fff' }
const headerInnerStyle: React.CSSProperties = { maxWidth: '1100px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
const logoLinkStyle: React.CSSProperties = { textDecoration: 'none' }
const logoTextStyle: React.CSSProperties = { fontSize: '1.35rem', fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.02em' }
const navStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.75rem' }
const navLinkStyle: React.CSSProperties = { color: '#1a1a2e', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, padding: '0.4rem 0.75rem' }
const navBtnStyle: React.CSSProperties = { ...navLinkStyle, backgroundColor: '#1a1a2e', color: '#fff', borderRadius: '6px', padding: '0.45rem 1rem' }

// --- Hero Styles ---
const heroStyle: React.CSSProperties = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem', backgroundColor: '#fff' }
const heroContentStyle: React.CSSProperties = { textAlign: 'center', maxWidth: '600px' }
const heroTitleStyle: React.CSSProperties = { fontSize: '3rem', fontWeight: 800, color: '#1a1a2e', margin: '0 0 0.75rem', letterSpacing: '-0.03em' }
const heroTaglineStyle: React.CSSProperties = { fontSize: '1.25rem', color: '#444', margin: '0 0 1rem', fontWeight: 400 }
const heroDescStyle: React.CSSProperties = { fontSize: '1rem', color: '#666', margin: '0 0 2.5rem', lineHeight: 1.6 }
const heroCTAStyle: React.CSSProperties = { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }
const primaryBtnStyle: React.CSSProperties = { padding: '0.75rem 2rem', backgroundColor: '#1a1a2e', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '1rem', fontWeight: 600 }
const secondaryBtnStyle: React.CSSProperties = { padding: '0.75rem 2rem', backgroundColor: '#fff', color: '#1a1a2e', border: '2px solid #1a1a2e', borderRadius: '8px', textDecoration: 'none', fontSize: '1rem', fontWeight: 600 }

// --- Features Styles ---
const featuresSectionStyle: React.CSSProperties = { backgroundColor: '#f8f9fa', padding: '4rem 1.5rem' }
const featuresInnerStyle: React.CSSProperties = { maxWidth: '1100px', margin: '0 auto' }
const featuresTitleStyle: React.CSSProperties = { textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 2.5rem' }
const featuresGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }
const featureCardStyle: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '12px', padding: '1.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }
const featureCardIconStyle: React.CSSProperties = { fontSize: '1.75rem', display: 'block', marginBottom: '0.75rem' }
const featureCardTitleStyle: React.CSSProperties = { margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600, color: '#1a1a2e' }
const featureCardDescStyle: React.CSSProperties = { margin: 0, fontSize: '0.875rem', color: '#666', lineHeight: 1.5 }

// --- Footer Styles ---
const footerStyle: React.CSSProperties = { backgroundColor: '#1a1a2e', padding: '1.5rem', textAlign: 'center' }
const footerTextStyle: React.CSSProperties = { margin: 0, fontSize: '0.8rem', color: '#888899' }
