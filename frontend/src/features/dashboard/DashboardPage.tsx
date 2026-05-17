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
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Dashboard</h2>

      {/* Financial summary row */}
      <div style={gridStyle}>
        <IncomeCard />
        <ExpensesCard />
        <NetProfitCard />
        <OutstandingCard />
      </div>

      {/* Booking counts */}
      <div style={{ ...gridStyle, marginTop: '1rem' }}>
        <BookingCountsCard />
      </div>

      {/* Task lists */}
      <div style={{ ...gridStyle, gridTemplateColumns: '1fr 1fr', marginTop: '1rem' }}>
        <PendingCleaningCard />
        <PendingMaintenanceCard />
      </div>
    </div>
  )
}

function IncomeCard() {
  const { data, isLoading, error } = useDashboardIncome()
  return (
    <DashboardCard title="Monthly Income" isLoading={isLoading} error={error}>
      <p style={valueStyle}>RM {(data ?? 0).toFixed(2)}</p>
    </DashboardCard>
  )
}

function ExpensesCard() {
  const { data, isLoading, error } = useDashboardExpenses()
  return (
    <DashboardCard title="Monthly Expenses" isLoading={isLoading} error={error}>
      <p style={valueStyle}>RM {(data ?? 0).toFixed(2)}</p>
    </DashboardCard>
  )
}

function NetProfitCard() {
  const { data, isLoading, error } = useDashboardNetProfit()
  const value = data ?? 0
  return (
    <DashboardCard title="Net Profit" isLoading={isLoading} error={error}>
      <p style={{ ...valueStyle, color: value >= 0 ? '#155724' : '#dc3545' }}>
        RM {value.toFixed(2)}
      </p>
    </DashboardCard>
  )
}

function OutstandingCard() {
  const { data, isLoading, error } = useDashboardOutstanding()
  return (
    <DashboardCard title="Outstanding Balance" isLoading={isLoading} error={error}>
      <p style={{ ...valueStyle, color: (data ?? 0) > 0 ? '#856404' : '#155724' }}>
        RM {(data ?? 0).toFixed(2)}
      </p>
    </DashboardCard>
  )
}

function BookingCountsCard() {
  const { data, isLoading, error } = useDashboardBookingCounts()
  return (
    <DashboardCard title="Bookings This Month" isLoading={isLoading} error={error}>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <CountBadge label="Confirmed" count={data?.confirmed ?? 0} color="#004085" bg="#cce5ff" />
        <CountBadge label="Checked In" count={data?.checked_in ?? 0} color="#155724" bg="#d4edda" />
        <CountBadge label="Checked Out" count={data?.checked_out ?? 0} color="#383d41" bg="#e2e3e5" />
        <CountBadge label="Cancelled" count={data?.cancelled ?? 0} color="#721c24" bg="#f8d7da" />
      </div>
    </DashboardCard>
  )
}

function PendingCleaningCard() {
  const { data, isLoading, error } = useDashboardPendingCleaning()
  return (
    <DashboardCard title="Pending Cleaning Tasks" isLoading={isLoading} error={error}>
      {data && data.length === 0 && <p style={emptyStyle}>All clean!</p>}
      {data && data.length > 0 && (
        <ul style={listStyle}>
          {data.map((task) => (
            <li key={task.id} style={listItemStyle}>
              <span>{task.unit?.name || `Unit #${task.id}`}</span>
              <span style={task.status === 'pending' ? pendingBadge : inProgressBadge}>{task.status}</span>
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
      {data && data.length === 0 && <p style={emptyStyle}>No open tasks.</p>}
      {data && data.length > 0 && (
        <ul style={listStyle}>
          {data.map((task) => (
            <li key={task.id} style={listItemStyle}>
              <span>{task.title}</span>
              <span style={priorityBadge(task.priority)}>{task.priority}</span>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  )
}

function CountBadge({ label, count, color, bg }: { label: string; count: number; color: string; bg: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ backgroundColor: bg, color, padding: '0.5rem 0.75rem', borderRadius: '0.375rem', fontSize: '1.25rem', fontWeight: 700 }}>
        {count}
      </div>
      <p style={{ margin: '0.25rem 0 0', fontSize: '0.7rem', color: '#666' }}>{label}</p>
    </div>
  )
}

function priorityBadge(priority: string): React.CSSProperties {
  const colors: Record<string, { bg: string; fg: string }> = {
    low: { bg: '#d4edda', fg: '#155724' },
    medium: { bg: '#fff3cd', fg: '#856404' },
    high: { bg: '#f8d7da', fg: '#721c24' },
  }
  const c = colors[priority] || { bg: '#e2e3e5', fg: '#383d41' }
  return { backgroundColor: c.bg, color: c.fg, padding: '0.1rem 0.4rem', borderRadius: '0.2rem', fontSize: '0.65rem', fontWeight: 500 }
}

const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }
const valueStyle: React.CSSProperties = { margin: 0, fontSize: '1.5rem', fontWeight: 700 }
const emptyStyle: React.CSSProperties = { margin: 0, color: '#888', fontSize: '0.875rem' }
const listStyle: React.CSSProperties = { listStyle: 'none', padding: 0, margin: 0 }
const listItemStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #f0f0f0', fontSize: '0.85rem' }
const pendingBadge: React.CSSProperties = { backgroundColor: '#fff3cd', color: '#856404', padding: '0.1rem 0.3rem', borderRadius: '0.2rem', fontSize: '0.65rem' }
const inProgressBadge: React.CSSProperties = { backgroundColor: '#cce5ff', color: '#004085', padding: '0.1rem 0.3rem', borderRadius: '0.2rem', fontSize: '0.65rem' }
