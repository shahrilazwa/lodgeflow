import type { ReactNode } from 'react'

interface DashboardCardProps {
  title: string
  isLoading: boolean
  error: unknown
  children: ReactNode
  className?: string
}

/**
 * A card component that independently shows loading/error/content states.
 */
export default function DashboardCard({ title, isLoading, error, children, className = '' }: DashboardCardProps) {
  return (
    <div className={`dashboard-card ${className}`}>
      <h3 className="dashboard-card-title">{title}</h3>
      {isLoading && <div className="dashboard-card-state">Loading...</div>}
      {!isLoading && !!error && <div className="dashboard-card-error">Failed to load</div>}
      {!isLoading && !error && children}
    </div>
  )
}
