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

      <section className="dashboard-section-grid">
        <BookingCountsCard />
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
    <DashboardCard title="Monthly Income" isLoading={isLoading} error={error}>
      <p className="dashboard-value">RM {(data ?? 0).toFixed(2)}</p>
      <p className="dashboard-helper">Collected this month</p>
    </DashboardCard>
  )
}

function ExpensesCard() {
  const { data, isLoading, error } = useDashboardExpenses()
  return (
    <DashboardCard title="Monthly Expenses" isLoading={isLoading} error={error}>
      <p className="dashboard-value">RM {(data ?? 0).toFixed(2)}</p>
      <p className="dashboard-helper">Recorded this month</p>
    </DashboardCard>
  )
}

function NetProfitCard() {
  const { data, isLoading, error } = useDashboardNetProfit()
  const value = data ?? 0
  return (
    <DashboardCard title="Net Profit" isLoading={isLoading} error={error}>
      <p className={`dashboard-value ${value >= 0 ? 'is-positive' : 'is-negative'}`}>RM {value.toFixed(2)}</p>
      <p className="dashboard-helper">Income minus expenses</p>
    </DashboardCard>
  )
}

function OutstandingCard() {
  const { data, isLoading, error } = useDashboardOutstanding()
  const value = data ?? 0
  return (
    <DashboardCard title="Outstanding Balance" isLoading={isLoading} error={error}>
      <p className={`dashboard-value ${value > 0 ? 'is-warning' : 'is-positive'}`}>RM {value.toFixed(2)}</p>
      <p className="dashboard-helper">Pending collection</p>
    </DashboardCard>
  )
}

function BookingCountsCard() {
  const { data, isLoading, error } = useDashboardBookingCounts()
  return (
    <DashboardCard title="Bookings This Month" isLoading={isLoading} error={error} className="dashboard-wide-card">
      <div className="dashboard-count-grid">
        <CountBadge label="Confirmed" count={data?.confirmed ?? 0} tone="blue" />
        <CountBadge label="Checked In" count={data?.checked_in ?? 0} tone="green" />
        <CountBadge label="Checked Out" count={data?.checked_out ?? 0} tone="neutral" />
        <CountBadge label="Cancelled" count={data?.cancelled ?? 0} tone="red" />
      </div>
    </DashboardCard>
  )
}

function PendingCleaningCard() {
  const { data, isLoading, error } = useDashboardPendingCleaning()
  return (
    <DashboardCard title="Pending Cleaning Tasks" isLoading={isLoading} error={error}>
      {data && data.length === 0 && <EmptyState message="All clean!" />}
      {data && data.length > 0 && (
        <ul className="dashboard-list">
          {data.map((task) => (
            <li key={task.id} className="dashboard-list-item">
              <span>{task.unit?.name || `Unit #${task.id}`}</span>
              <span className={`dashboard-pill ${task.status === 'pending' ? 'is-warning' : 'is-blue'}`}>{task.status}</span>
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
      {data && data.length === 0 && <EmptyState message="No open tasks." />}
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

function CountBadge({ label, count, tone }: { label: string; count: number; tone: string }) {
  return (
    <div className="dashboard-count-item">
      <div className={`dashboard-count-number is-${tone}`}>{count}</div>
      <p>{label}</p>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return <p className="dashboard-empty">{message}</p>
}

function priorityTone(priority: string): string {
  const tones: Record<string, string> = {
    low: 'is-positive',
    medium: 'is-warning',
    high: 'is-negative',
  }
  return tones[priority] ?? 'is-neutral'
}

const dashboardStyles = `
  .dashboard-page { max-width: 1280px; margin: 0 auto; }
  .dashboard-header { margin-bottom: 24px; }
  .dashboard-eyebrow { margin: 0 0 6px; color: #2563eb; font-size: 0.78rem; font-weight: 800; letter-spacing: 0.03em; text-transform: uppercase; }
  .dashboard-header h1 { margin: 0; color: #18181b; font-size: clamp(1.9rem, 4vw, 3rem); font-weight: 900; letter-spacing: -0.04em; }
  .dashboard-description { max-width: 640px; margin: 10px 0 0; color: #71717a; font-size: 0.98rem; line-height: 1.65; }
  .dashboard-metric-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
  .dashboard-section-grid { margin-top: 16px; }
  .dashboard-task-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 16px; }
  .dashboard-card { min-height: 132px; display: flex; flex-direction: column; border: 1px solid #e4e4e7; border-radius: 16px; background: #ffffff; box-shadow: 0 1px 2px rgba(24, 24, 27, 0.04); padding: 22px; }
  .dashboard-card-title { margin: 0 0 16px; color: #71717a; font-size: 0.78rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
  .dashboard-card-state, .dashboard-card-error { flex: 1; display: flex; align-items: center; color: #71717a; font-size: 0.9rem; }
  .dashboard-card-error { color: #dc2626; }
  .dashboard-value { margin: 0; color: #18181b; font-size: clamp(1.55rem, 3vw, 2.15rem); line-height: 1.1; font-weight: 900; letter-spacing: -0.03em; }
  .dashboard-value.is-positive { color: #047857; }
  .dashboard-value.is-negative { color: #dc2626; }
  .dashboard-value.is-warning { color: #b45309; }
  .dashboard-helper { margin: 10px 0 0; color: #71717a; font-size: 0.82rem; }
  .dashboard-wide-card { min-height: 156px; }
  .dashboard-count-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
  .dashboard-count-item p { margin: 8px 0 0; color: #52525b; font-size: 0.82rem; font-weight: 700; }
  .dashboard-count-number { min-height: 54px; display: flex; align-items: center; justify-content: center; border-radius: 12px; font-size: 1.45rem; font-weight: 900; }
  .dashboard-count-number.is-blue, .dashboard-pill.is-blue { background: #eff6ff; color: #2563eb; }
  .dashboard-count-number.is-green, .dashboard-pill.is-positive { background: #ecfdf5; color: #047857; }
  .dashboard-count-number.is-neutral, .dashboard-pill.is-neutral { background: #f4f4f5; color: #52525b; }
  .dashboard-count-number.is-red, .dashboard-pill.is-negative { background: #fef2f2; color: #dc2626; }
  .dashboard-pill.is-warning { background: #fffbeb; color: #b45309; }
  .dashboard-list { margin: 0; padding: 0; list-style: none; }
  .dashboard-list-item { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 12px 0; border-bottom: 1px solid #f4f4f5; color: #18181b; font-size: 0.9rem; }
  .dashboard-list-item:last-child { border-bottom: 0; }
  .dashboard-pill { display: inline-flex; align-items: center; justify-content: center; min-height: 24px; padding: 0 9px; border-radius: 999px; font-size: 0.72rem; font-weight: 800; text-transform: capitalize; white-space: nowrap; }
  .dashboard-empty { margin: 0; color: #71717a; font-size: 0.95rem; }
  @media (max-width: 1100px) { .dashboard-metric-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 720px) { .dashboard-metric-grid, .dashboard-task-grid, .dashboard-count-grid { grid-template-columns: 1fr; } .dashboard-card { padding: 18px; } }
`
