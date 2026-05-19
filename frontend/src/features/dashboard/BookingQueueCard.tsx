import { Link } from 'react-router-dom'
import DashboardCard from './DashboardCard'
import { useDashboardBookingQueue } from './api'
import type { BookingQueueItem } from './api'

export default function BookingQueueCard() {
  const { data, isLoading, error } = useDashboardBookingQueue()
  const queueItems = data ? [
    ...data.awaiting_confirmation,
    ...data.upcoming_check_ins,
    ...data.upcoming_check_outs,
    ...data.currently_checked_in,
    ...data.payment_attention,
  ].slice(0, 8) : []

  return (
    <DashboardCard title="Booking Queue" isLoading={isLoading} error={error} className="dashboard-booking-queue-card">
      {data && queueItems.length === 0 && (
        <p className="dashboard-empty">No urgent booking activity in the next 24 hours.</p>
      )}

      {queueItems.length > 0 && (
        <div className="dashboard-booking-queue">
          <div className="dashboard-queue-header">
            <span>Front desk queue</span>
            <strong>Needs attention</strong>
          </div>

          <ul className="dashboard-queue-list">
            {queueItems.map((item) => (
              <BookingQueueRow key={`${item.queue_type}-${item.id}`} item={item} />
            ))}
          </ul>
        </div>
      )}
    </DashboardCard>
  )
}

function BookingQueueRow({ item }: { item: BookingQueueItem }) {
  return (
    <li className="dashboard-queue-row">
      <div>
        <Link to={`/bookings/${item.id}`} className="dashboard-queue-name">{item.guest_name}</Link>
        <p>{item.unit_name}</p>
      </div>
      <div className="dashboard-queue-meta">
        <span className={`dashboard-pill ${queueTone(item.queue_type)}`}>{item.queue_label}</span>
        {item.outstanding_amount > 0 && <small>RM {item.outstanding_amount.toFixed(2)} due</small>}
      </div>
    </li>
  )
}

function queueTone(type: string): string {
  const tones: Record<string, string> = {
    awaiting_confirmation: 'is-orange',
    check_in: 'is-blue',
    check_out: 'is-neutral',
    in_house: 'is-green',
    payment_attention: 'is-orange',
  }

  return tones[type] ?? 'is-neutral'
}
