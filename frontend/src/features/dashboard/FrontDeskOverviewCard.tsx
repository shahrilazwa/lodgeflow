import DashboardCard from './DashboardCard'
import { useDashboardFrontDeskOverview } from './api'

export default function FrontDeskOverviewCard() {
  const { data, isLoading, error } = useDashboardFrontDeskOverview()

  return (
    <DashboardCard title="Front Desk Overview" isLoading={isLoading} error={error} className="dashboard-frontdesk-card">
      {data && (
        <div className="dashboard-frontdesk-layout">
          <div>
            <p className="dashboard-frontdesk-kicker">Today</p>
            <h2>Daily operations</h2>
            <p className="dashboard-frontdesk-subtitle">Live view of occupancy, arrivals, departures and operational attention.</p>
            <div className="dashboard-frontdesk-occupancy">
              <strong>{data.occupied_units} / {data.active_units}</strong>
              <span>{data.occupancy_rate}% occupied</span>
            </div>
          </div>

          <div className="dashboard-frontdesk-stats">
            <FrontDeskStat label="Check-ins" value={data.check_ins_today} />
            <FrontDeskStat label="Check-outs" value={data.check_outs_today} />
            <FrontDeskStat label="Pending payment" value={data.pending_payments} />
            <FrontDeskStat label="Cleaning" value={data.pending_cleaning} />
            <FrontDeskStat label="Maintenance" value={data.open_maintenance} />
          </div>
        </div>
      )}
    </DashboardCard>
  )
}

function FrontDeskStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="dashboard-frontdesk-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
