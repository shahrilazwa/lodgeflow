import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBookings } from './api'
import { BOOKING_STATUSES, BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS } from './types'
import type { Booking, BookingFilters } from './types'

export default function BookingsPage() {
  const [filters, setFilters] = useState<BookingFilters>({})
  const { data: bookings, isLoading, error } = useBookings(filters)

  if (error) return <div style={{ color: 'red' }}>Error loading bookings.</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Bookings</h2>
        <Link to="/bookings/create" style={linkButtonStyle}>+ New Booking</Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <select
          value={filters.status || ''}
          onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
          style={selectStyle}
        >
          <option value="">All Statuses</option>
          {BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>{BOOKING_STATUS_LABELS[s]}</option>
          ))}
        </select>
        <input
          type="date"
          placeholder="From"
          value={filters.from_date || ''}
          onChange={(e) => setFilters({ ...filters, from_date: e.target.value || undefined })}
          style={selectStyle}
        />
        <input
          type="date"
          placeholder="To"
          value={filters.to_date || ''}
          onChange={(e) => setFilters({ ...filters, to_date: e.target.value || undefined })}
          style={selectStyle}
        />
      </div>

      {isLoading && <div>Loading bookings...</div>}

      {bookings && bookings.length === 0 && (
        <p style={{ color: '#666' }}>No bookings found.</p>
      )}

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {bookings?.map((booking: Booking) => (
          <div key={booking.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Link to={`/bookings/${booking.id}`} style={{ textDecoration: 'none', color: '#1a1a2e' }}>
                  <h4 style={{ margin: '0 0 0.25rem' }}>
                    {booking.guest?.full_name || 'Guest'} — {booking.unit?.name || 'Unit'}
                  </h4>
                </Link>
                <p style={{ margin: 0, color: '#555', fontSize: '0.875rem' }}>
                  {booking.check_in_date} → {booking.check_out_date}
                </p>
                <p style={{ margin: '0.25rem 0 0', color: '#555', fontSize: '0.875rem' }}>
                  RM {Number(booking.total_amount).toFixed(2)}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
                <span style={statusBadge(booking.status)}>{BOOKING_STATUS_LABELS[booking.status]}</span>
                <span style={paymentBadge(booking.payment_status)}>{PAYMENT_STATUS_LABELS[booking.payment_status]}</span>
              </div>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <Link to={`/bookings/${booking.id}`} style={smallBtnStyle}>View</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function statusBadge(status: string): React.CSSProperties {
  const colors: Record<string, { bg: string; fg: string }> = {
    confirmed: { bg: '#cce5ff', fg: '#004085' },
    checked_in: { bg: '#d4edda', fg: '#155724' },
    checked_out: { bg: '#e2e3e5', fg: '#383d41' },
    cancelled: { bg: '#f8d7da', fg: '#721c24' },
  }
  const c = colors[status] || { bg: '#e2e3e5', fg: '#383d41' }
  return { backgroundColor: c.bg, color: c.fg, padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: 600 }
}

function paymentBadge(status: string): React.CSSProperties {
  const colors: Record<string, { bg: string; fg: string }> = {
    unpaid: { bg: '#f8d7da', fg: '#721c24' },
    partial: { bg: '#fff3cd', fg: '#856404' },
    paid: { bg: '#d4edda', fg: '#155724' },
    overpaid: { bg: '#cce5ff', fg: '#004085' },
    refunded: { bg: '#e2e3e5', fg: '#383d41' },
  }
  const c = colors[status] || { bg: '#e2e3e5', fg: '#383d41' }
  return { backgroundColor: c.bg, color: c.fg, padding: '0.15rem 0.4rem', borderRadius: '0.2rem', fontSize: '0.65rem', fontWeight: 500 }
}

const cardStyle: React.CSSProperties = { border: '1px solid #e0e0e0', borderRadius: '0.5rem', padding: '1rem', backgroundColor: '#fff' }
const linkButtonStyle: React.CSSProperties = { padding: '0.5rem 1rem', backgroundColor: '#1a1a2e', color: '#fff', borderRadius: '0.375rem', textDecoration: 'none', fontSize: '0.875rem' }
const smallBtnStyle: React.CSSProperties = { padding: '0.25rem 0.5rem', border: '1px solid #ccc', borderRadius: '0.25rem', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'none', color: '#333', backgroundColor: '#fff' }
const selectStyle: React.CSSProperties = { padding: '0.4rem', border: '1px solid #ccc', borderRadius: '0.375rem', fontSize: '0.875rem' }
