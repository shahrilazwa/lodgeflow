import { Outlet } from 'react-router-dom'

/**
 * Layout wrapper for public routes (login, register).
 * Split-panel design: brand section + form section.
 */
export default function PublicLayout() {
  return (
    <div style={containerStyle} className="public-layout">
      {/* Brand Panel */}
      <div style={brandPanelStyle} className="brand-panel">
        <div style={brandContentStyle}>
          <h1 style={logoStyle}>LodgeFlow</h1>
          <p style={taglineStyle}>
            Property operations for small lodging and short-stay rental businesses.
          </p>

          <div style={featuresStyle}>
            <div style={featureItemStyle}>
              <span style={featureIconStyle}>📋</span>
              <span>Manage bookings and guests</span>
            </div>
            <div style={featureItemStyle}>
              <span style={featureIconStyle}>💰</span>
              <span>Track payments and expenses</span>
            </div>
            <div style={featureItemStyle}>
              <span style={featureIconStyle}>🧹</span>
              <span>Coordinate cleaning and maintenance</span>
            </div>
            <div style={featureItemStyle}>
              <span style={featureIconStyle}>📊</span>
              <span>View business performance insights</span>
            </div>
          </div>

          <p style={footerTextStyle}>
            Built for homestay and lodging owners in Malaysia.
          </p>
        </div>
      </div>

      {/* Form Panel */}
      <div style={formPanelStyle} className="form-panel">
        <div style={formContainerStyle}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'row',
}

const brandPanelStyle: React.CSSProperties = {
  flex: '1 1 55%',
  backgroundColor: '#1a1a2e',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3rem',
}

const brandContentStyle: React.CSSProperties = {
  maxWidth: '420px',
}

const logoStyle: React.CSSProperties = {
  fontSize: '2.25rem',
  fontWeight: 800,
  margin: '0 0 0.75rem',
  letterSpacing: '-0.02em',
}

const taglineStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  lineHeight: 1.5,
  color: '#c8c8d0',
  margin: '0 0 2.5rem',
}

const featuresStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
}

const featureItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  fontSize: '0.95rem',
  color: '#e0e0e8',
}

const featureIconStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  width: '2rem',
  textAlign: 'center',
  flexShrink: 0,
}

const footerTextStyle: React.CSSProperties = {
  marginTop: '3rem',
  fontSize: '0.8rem',
  color: '#888899',
}

const formPanelStyle: React.CSSProperties = {
  flex: '1 1 45%',
  backgroundColor: '#f8f9fa',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
}

const formContainerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '400px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
  padding: '2.5rem',
}
