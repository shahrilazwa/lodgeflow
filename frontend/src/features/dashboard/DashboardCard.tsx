import type { ReactNode } from 'react'

interface DashboardCardProps {
  title: string
  isLoading: boolean
  error: unknown
  children: ReactNode
}

/**
 * A card component that independently shows loading/error/content states.
 * Each dashboard metric card fetches its own data and renders independently.
 */
export default function DashboardCard({ title, isLoading, error, children }: DashboardCardProps) {
  return (
    <div style={cardStyle}>
      <h4 style={titleStyle}>{title}</h4>
      {isLoading && <div style={loadingStyle}>Loading...</div>}
      {!isLoading && !!error && (
        <div style={errorStyle}>Failed to load</div>
      )}
      {!isLoading && !error && children}
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  border: '1px solid #e0e0e0',
  borderRadius: '0.5rem',
  padding: '1.25rem',
  backgroundColor: '#fff',
  minHeight: '100px',
  display: 'flex',
  flexDirection: 'column',
}
const titleStyle: React.CSSProperties = { margin: '0 0 0.75rem', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }
const loadingStyle: React.CSSProperties = { color: '#aaa', fontSize: '0.875rem', flex: 1, display: 'flex', alignItems: 'center' }
const errorStyle: React.CSSProperties = { color: '#dc3545', fontSize: '0.875rem', flex: 1, display: 'flex', alignItems: 'center' }
