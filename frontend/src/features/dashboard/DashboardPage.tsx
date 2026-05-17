import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBroom,
  faCalendarCheck,
  faChartLine,
  faFileInvoiceDollar,
  faMoneyBillTrendUp,
  faScrewdriverWrench,
  faWallet,
} from '@fortawesome/free-solid-svg-icons'
import type { CSSProperties } from 'react'
import {
  useDashboardIncome,
  useDashboardExpenses,
  useDashboardNetProfit,
  useDashboardOutstanding,
  useDashboardBookingCounts,
  useDashboardPendingCleaning,
  useDashboardPendingMaintenance,
} from './api'
import DashboardCard from './DashboardCard'

export default function DashboardPage() {
  return (
    <div className="dashboard-page">
      <style>{dashboardStyles}</style>

      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">Overview</p>
          <h1>Dashboard</h1>
          <p className="dashboard-description">Monitor income, bookings, balances and operational tasks from one calm workspace.</p>
        </div>
      </header>

      <section className="dashboard-metric-grid" aria-label="Financial summary">
        <IncomeCard />
        <ExpensesCard />
        <NetProfitCard />
        <OutstandingCard />
      </section>

      <section className="dashboard-insight-grid" aria-label="Booking and operations summary">
        <BookingCountsCard />
        <OperationsSnapshotCard />
      </section>

      <section className="dashboard-task-grid" aria-label="Operational tasks">
        <PendingCleaningCard />
        <PendingMaintenanceCard />
      </section>
    </div>
  )
}

function IncomeCard() {
  const { data, isLoading, error } = useDashboardIncome()
  return (
    <MetricCard
      title="Monthly Income"
      value={`RM ${(data ?? 0).toFixed(2)}`}
      helper="Collected this month"
      icon={faMoneyBillTrendUp}
      tone="blue"
      isLoading={isLoading}
      error={error}
    />
  )
}

function ExpensesCard() {
  const { data, isLoading, error } = useDashboardExpenses()
  return (
    <MetricCard
      title="Monthly Expenses"
      value={`RM ${(data ?? 0).toFixed(2)}`}
      helper="Recorded this month"
      icon={faFileInvoiceDollar}
      tone="neutral"
      isLoading={isLoading}
      error={error}
    />
  )
}

function NetProfitCard() {
  const { data, isLoading, error } = useDashboardNetProfit()
  const value = data ?? 0
  return (
    <MetricCard
      title="Net Profit"
      value={`RM ${value.toFixed(2)}`}
      helper="Income minus expenses"
      icon={faChartLine}
      tone={value >= 0 ? 'green' : 'red'}
      isLoading={isLoading}
      error={error}
    />
  )
}

function OutstandingCard() {
  const { data, isLoading, error } = useDashboardOutstanding()
  const value = data ?? 0
  return (
    <MetricCard
      title="Outstanding Balance"
      value={`RM ${value.toFixed(2)}`}
      helper="Pending collection"
      icon={faWallet}
      tone={value > 0 ? 'orange' : 'green'}
      isLoading={isLoading}
      error={error}
    />
  )
}

function MetricCard({
  title,
  value,
  helper,
  icon,
  tone,
  isLoading,
  error,
}: {
  title: string
  value: string
  helper: string
  icon: Parameters<typeof FontAwesomeIcon>[0]['icon']
  tone: 'blue' | 'green' | 'red' | 'orange' | 'neutral'
  isLoading: boolean
  error: unknown
}) {
  return (
    <DashboardCard title={title} isLoading={isLoading} error={error} className="dashboard-metric-card">
      <div className="dashboard-metric-body">
        <div>
          <p className={`dashboard-value is-${tone}`}>{value}</p>
          <p className="dashboard-helper">{helper}</p>
        </div>
        <div className={`dashboard-icon-tile is-${tone}`}>
          <FontAwesomeIcon icon={icon} aria-hidden="true" />
        </div>
      </div>
    </DashboardCard>
  )
}

function BookingCountsCard() {
  const { data, isLoading, error } = useDashboardBookingCounts()
  const counts = {
    confirmed: data?.confirmed ?? 0,
    checkedIn: data?.checked_in ?? 0,
    checkedOut: data?.checked_out ?? 0,
    cancelled: data?.cancelled ?? 0,
  }
  const total = counts.confirmed + counts.checkedIn + counts.checkedOut + counts.cancelled

  return (
    <DashboardCard title="Bookings This Month" isLoading={isLoading} error={error} className="dashboard-infographic-card">
      <div className="dashboard-booking-layout">
        <div className="dashboard-ring-group">
          <ProgressRing value={percentage(counts.confirmed, total)} label="Confirmed" count={counts.confirmed} tone="blue" />
          <ProgressRing value={percentage(counts.checkedIn, total)} label="Checked in" count={counts.checkedIn} tone="green" />
          <ProgressRing value={percentage(counts.cancelled, total)} label="Cancelled" count={counts.cancelled} tone="red" />
        </div>

        <div className="dashboard-bars" aria-label="Booking status breakdown">
          <ProgressBar label="Confirmed" value={percentage(counts.confirmed, total)} count={counts.confirmed} tone="blue" />
          <ProgressBar label="Checked in" value={percentage(counts.checkedIn, total)} count={counts.checkedIn} tone="green" />
          <ProgressBar label="Checked out" value={percentage(counts.checkedOut, total)} count={counts.checkedOut} tone="neutral" />
          <ProgressBar label="Cancelled" value={percentage(counts.cancelled, total)} count={counts.cancelled} tone="red" />
        </div>
      </div>
    </DashboardCard>
  )
}

function OperationsSnapshotCard() {
  const cleaning = useDashboardPendingCleaning()
  const maintenance = useDashboardPendingMaintenance()
  const pendingCleaning = cleaning.data?.length ?? 0
  const openMaintenance = maintenance.data?.length ?? 0
  const totalTasks = pendingCleaning + openMaintenance
  const cleanScore = totalTasks === 0 ? 100 : Math.max(0, 100 - totalTasks * 20)

  return (
    <DashboardCard title="Operations Snapshot" isLoading={cleaning.isLoading || maintenance.isLoading} error={cleaning.error || maintenance.error} className="dashboard-infographic-card">
      <div className="dashboard-operations-layout">
        <ProgressRing value={cleanScore} label="Operational readiness" count={`${cleanScore}%`} tone={cleanScore >= 80 ? 'green' : 'orange'} />
        <div className="dashboard-operation-list">
          <OperationStat icon={faBroom} label="Pending cleaning" value={pendingCleaning} tone={pendingCleaning === 0 ? 'green' : 'orange'} />
          <OperationStat icon={faScrewdriverWrench} label="Open maintenance" value={openMaintenance} tone={openMaintenance === 0 ? 'green' : 'red'} />
          <OperationStat icon={faCalendarCheck} label="Tasks needing action" value={totalTasks} tone={totalTasks === 0 ? 'green' : 'orange'} />
        </div>
      </div>
    </DashboardCard>
  )
}

function PendingCleaningCard() {
  const { data, isLoading, error } = useDashboardPendingCleaning()
  return (
    <DashboardCard title="Pending Cleaning Tasks" isLoading={isLoading} error={error}>
      {data && data.length === 0 && <EmptyState icon={faBroom} message="All clean!" />}
      {data && data.length > 0 && (
        <ul className="dashboard-list">
          {data.map((task) => (
            <li key={task.id} className="dashboard-list-item">
              <span>{task.unit?.name || `Unit #${task.id}`}</span>
              <span className={`dashboard-pill ${task.status === 'pending' ? 'is-orange' : 'is-blue'}`}>{task.status}</span>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  )
}

function PendingMaintenanceCard() {
  const { data, isLoading, error } = useDashboardPendingMaintenance()
  return (
    <DashboardCard title="Open Maintenance Tasks" isLoading={isLoading} error={error}>
      {data && data.length === 0 && <EmptyState icon={faScrewdriverWrench} message="No open tasks." />}
      {data && data.length > 0 && (
        <ul className="dashboard-list">
          {data.map((task) => (
            <li key={task.id} className="dashboard-list-item">
              <span>{task.title}</span>
              <span className={`dashboard-pill ${priorityTone(task.priority)}`}>{task.priority}</span>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  )
}

function ProgressRing({ value, label, count, tone }: { value: number; label: string; count: string | number; tone: string }) {
  return (
    <div className="dashboard-ring-item">
      <div className={`dashboard-ring is-${tone}`} style={{ '--ring-value': `${value}%` } as CSSProperties}>
        <span>{count}</span>
      </div>
      <p>{label}</p>
    </div>
  )
}

function ProgressBar({ label, value, count, tone }: { label: string; value: number; count: number; tone: string }) {
  return (
    <div className="dashboard-bar-row">
      <div className="dashboard-bar-meta">
        <span>{label}</span>
        <strong>{count}</strong>
      </div>
      <div className="dashboard-bar-track">
        <span className={`dashboard-bar-fill is-${tone}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function OperationStat({ icon, label, value, tone }: { icon: Parameters<typeof FontAwesomeIcon>[0]['icon']; label: string; value: number; tone: string }) {
  return (
    <div className="dashboard-operation-stat">
      <div className={`dashboard-icon-tile is-${tone}`}>
        <FontAwesomeIcon icon={icon} aria-hidden="true" />
      </div>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  )
}

function EmptyState({ icon, message }: { icon: Parameters<typeof FontAwesomeIcon>[0]['icon']; message: string }) {
  return (
    <p className="dashboard-empty">
      <FontAwesomeIcon icon={icon} aria-hidden="true" />
      <span>{message}</span>
    </p>
  )
}

function percentage(value: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((value / total) * 100)
}

function priorityTone(priority: string): string {
  const tones: Record<string, string> = {
    low: 'is-green',
    medium: 'is-orange',
    high: 'is-red',
  }
  return tones[priority] ?? 'is-neutral'
}

const dashboardStyles = `
  .dashboard-page { max-width: 1280px; margin: 0 auto; }
  .dashboard-header { margin-bottom: 22px; }
  .dashboard-eyebrow { margin: 0 0 6px; color: #2563eb; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; }
  .dashboard-header h1 { margin: 0; color: #18181b; font-size: clamp(1.65rem, 3vw, 2.35rem); font-weight: 800; letter-spacing: -0.035em; }
  .dashboard-description { max-width: 620px; margin: 8px 0 0; color: #71717a; font-size: 0.9rem; line-height: 1.6; }
  .dashboard-metric-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
  .dashboard-insight-grid { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.9fr); gap: 14px; margin-top: 14px; }
  .dashboard-task-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-top: 14px; }
  .dashboard-card { min-height: 124px; display: flex; flex-direction: column; border: 1px solid #e4e4e7; border-radius: 16px; background: #ffffff; box-shadow: 0 1px 2px rgba(24, 24, 27, 0.04); padding: 20px; }
  .dashboard-card-title { margin: 0 0 14px; color: #71717a; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; }
  .dashboard-card-state, .dashboard-card-error { flex: 1; display: flex; align-items: center; color: #71717a; font-size: 0.85rem; }
  .dashboard-card-error { color: #dc2626; }
  .dashboard-metric-body { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
  .dashboard-value { margin: 0; color: #18181b; font-size: clamp(1.35rem, 2.4vw, 1.85rem); line-height: 1.1; font-weight: 800; letter-spacing: -0.03em; }
  .dashboard-value.is-blue { color: #2563eb; }
  .dashboard-value.is-green { color: #047857; }
  .dashboard-value.is-red { color: #dc2626; }
  .dashboard-value.is-orange { color: #b45309; }
  .dashboard-value.is-neutral { color: #18181b; }
  .dashboard-helper { margin: 9px 0 0; color: #71717a; font-size: 0.78rem; }
  .dashboard-icon-tile { width: 48px; height: 48px; flex: 0 0 48px; display: inline-flex; align-items: center; justify-content: center; border-radius: 14px; font-size: 1.18rem; }
  .dashboard-icon-tile svg { opacity: 0.72; }
  .dashboard-icon-tile.is-blue, .dashboard-bar-fill.is-blue, .dashboard-pill.is-blue { background: #eff6ff; color: #2563eb; }
  .dashboard-icon-tile.is-green, .dashboard-bar-fill.is-green, .dashboard-pill.is-green { background: #ecfdf5; color: #047857; }
  .dashboard-icon-tile.is-red, .dashboard-bar-fill.is-red, .dashboard-pill.is-red { background: #fef2f2; color: #dc2626; }
  .dashboard-icon-tile.is-orange, .dashboard-bar-fill.is-orange, .dashboard-pill.is-orange { background: #fffbeb; color: #b45309; }
  .dashboard-icon-tile.is-neutral, .dashboard-bar-fill.is-neutral, .dashboard-pill.is-neutral { background: #f4f4f5; color: #52525b; }
  .dashboard-infographic-card { min-height: 240px; }
  .dashboard-booking-layout, .dashboard-operations-layout { display: grid; grid-template-columns: auto 1fr; gap: 28px; align-items: center; }
  .dashboard-ring-group { display: flex; gap: 18px; flex-wrap: wrap; }
  .dashboard-ring-item { width: 96px; text-align: center; }
  .dashboard-ring-item p { margin: 8px 0 0; color: #52525b; font-size: 0.78rem; font-weight: 650; }
  .dashboard-ring { --ring-value: 0%; width: 76px; height: 76px; margin: 0 auto; display: grid; place-items: center; border-radius: 999px; background: conic-gradient(currentColor var(--ring-value), #f1f5f9 0); color: #2563eb; position: relative; }
  .dashboard-ring::before { content: ''; position: absolute; inset: 9px; border-radius: inherit; background: #ffffff; }
  .dashboard-ring span { position: relative; color: #18181b; font-size: 1rem; font-weight: 800; }
  .dashboard-ring.is-green { color: #16a34a; }
  .dashboard-ring.is-red { color: #dc2626; }
  .dashboard-ring.is-orange { color: #d97706; }
  .dashboard-ring.is-blue { color: #2563eb; }
  .dashboard-ring.is-neutral { color: #71717a; }
  .dashboard-bars { display: grid; gap: 12px; }
  .dashboard-bar-row { display: grid; gap: 6px; }
  .dashboard-bar-meta { display: flex; align-items: center; justify-content: space-between; gap: 12px; color: #52525b; font-size: 0.78rem; font-weight: 650; }
  .dashboard-bar-meta strong { color: #18181b; }
  .dashboard-bar-track { height: 9px; overflow: hidden; border-radius: 999px; background: #f1f5f9; }
  .dashboard-bar-fill { display: block; height: 100%; min-width: 3px; border-radius: inherit; }
  .dashboard-operation-list { display: grid; gap: 12px; }
  .dashboard-operation-stat { display: flex; align-items: center; gap: 12px; padding: 10px; border: 1px solid #f1f5f9; border-radius: 14px; background: #fafafa; }
  .dashboard-operation-stat strong, .dashboard-operation-stat span { display: block; }
  .dashboard-operation-stat strong { color: #18181b; font-size: 1.05rem; }
  .dashboard-operation-stat span { color: #71717a; font-size: 0.78rem; }
  .dashboard-list { margin: 0; padding: 0; list-style: none; }
  .dashboard-list-item { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 11px 0; border-bottom: 1px solid #f4f4f5; color: #18181b; font-size: 0.84rem; }
  .dashboard-list-item:last-child { border-bottom: 0; }
  .dashboard-pill { display: inline-flex; align-items: center; justify-content: center; min-height: 22px; padding: 0 8px; border-radius: 999px; font-size: 0.7rem; font-weight: 700; text-transform: capitalize; white-space: nowrap; }
  .dashboard-empty { margin: 0; display: inline-flex; align-items: center; gap: 8px; color: #71717a; font-size: 0.86rem; }
  @media (max-width: 1180px) { .dashboard-metric-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .dashboard-insight-grid { grid-template-columns: 1fr; } }
  @media (max-width: 720px) { .dashboard-metric-grid, .dashboard-task-grid, .dashboard-booking-layout, .dashboard-operations-layout { grid-template-columns: 1fr; } .dashboard-card { padding: 18px; } }
`
