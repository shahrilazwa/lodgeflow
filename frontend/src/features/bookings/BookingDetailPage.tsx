import { useParams, Link, useNavigate } from 'react-router-dom'
import { useBooking, useCheckInBooking, useCheckOutBooking, useCancelBooking } from './api'
import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS } from './types'

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: booking, isLoading, error } = useBooking(Number(id))
  const checkIn = useCheckInBooking()
  const checkOut = useCheckOutBooking()
  const cancel = useCancelBooking()

  if (isLoading) return <div>Loading booking...</div>
  if (error) return <div style={{ color: 'red' }}>Booking not found.</div>
  if (!booking) return <div>Booking not found.</div>

  const outstanding = Math.max(0, Number(booking.total_amount) - Number(booking.net_paid_amount))
  const overpaid = Math.max(0, Number(booking.net_paid_amount) - Number(booking.total_amount))

  async function handleCheckIn() {
    await checkIn.mutateAsync(booking!.id)
    navigate(`/bookings/${booking!.id}`)
  }

  async function handleCheckOut() {
    await checkOut.mutateAsync(booking!.id)
    navigate(`/bookings/${booking!.id}`)
  }

  async function handleCancel() {
    if (confirm('Are you sure you want to cancel this booking?')) {
      await cancel.mutateAsync(booking!.id)
      navigate(`/bookings/${booking!.id}`)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/bookings" style={{ color: '#555', fontSize: '0.875rem' }}>← Back to Bookings</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Booking #{booking.id}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={statusBadge(booking.status)}>{BOOKING_STATUS_LABELS[booking.status]}</span>
          <span style={paymentBadge(booking.payment_status)}>{PAYMENT_STATUS_LABELS[booking.payment_status]}</span>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p style={labelText}>Guest</p>
            <p style={valueText}>{booking.guest?.full_name || '—'}</p>
          </div>
          <div>
            <p style={labelText}>Unit</p>
            <p style={valueText}>{booking.unit?.name || '—'}</p>
          </div>
          <div>
            <p style={labelText}>Check-in</p>
            <p style={valueText}>{booking.check_in_date}</p>
          </div>
          <div>
            <p style={labelText}>Check-out</p>
            <p style={valueText}>{booking.check_out_date}</p>
          </div>
          <div>
            <p style={labelText}>Total Amount</p>
            <p style={valueText}>RM {Number(booking.total_amount).toFixed(2)}</p>
          </div>
          <div>
            <p style={labelText}>Net Paid</p>
            <p style={valueText}>RM {Number(booking.net_paid_amount).toFixed(2)}</p>
          </div>
        </div>

        {outstanding > 0 && (
          <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#fff3cd', borderRadius: '0.25rem' }}>
            <strong>Outstanding Balance:</strong> RM {outstanding.toFixed(2)}
          </div>
        )}
        {overpaid > 0 && (
          <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#cce5ff', borderRadius: '0.25rem' }}>
            <strong>Overpaid:</strong> RM {overpaid.toFixed(2)}
          </div>
        )}
      </div>

      {/* Status transition buttons */}
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {booking.status === 'confirmed' && (
          <>
            <button type="button" onClick={handleCheckIn} disabled={checkIn.isPending} style={actionBtn}>
              {checkIn.isPending ? 'Processing...' : 'Check In'}
            </button>
            <Link to={`/bookings/${booking.id}/edit`} style={editBtn}>Edit</Link>
            <button type="button" onClick={handleCancel} disabled={cancel.isPending} style={dangerBtn}>
              {cancel.isPending ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          </>
        )}
        {booking.status === 'checked_in' && (
          <>
            <button type="button" onClick={handleCheckOut} disabled={checkOut.isPending} style={actionBtn}>
              {checkOut.isPending ? 'Processing...' : 'Check Out'}
            </button>
            <button type="button" onClick={handleCancel} disabled={cancel.isPending} style={dangerBtn}>
              {cancel.isPending ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          </>
        )}
      </div>

      {(checkIn.error || checkOut.error || cancel.error) && (
        <div style={{ marginTop: '0.5rem', color: '#dc3545', fontSize: '0.875rem' }}>
          Status transition failed. The booking may not be in the correct state.
        </div>
      )}
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
  return { backgroundColor: c.bg, color: c.fg, padding: '0.25rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.8rem', fontWeight: 600 }
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
  return { backgroundColor: c.bg, color: c.fg, padding: '0.25rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.8rem', fontWeight: 600 }
}

const cardStyle: React.CSSProperties = { border: '1px solid #e0e0e0', borderRadius: '0.5rem', padding: '1.5rem', backgroundColor: '#fff' }
const labelText: React.CSSProperties = { margin: 0, fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }
const valueText: React.CSSProperties = { margin: '0.25rem 0 0', fontSize: '0.95rem', fontWeight: 500 }
const actionBtn: React.CSSProperties = { padding: '0.5rem 1rem', backgroundColor: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }
const editBtn: React.CSSProperties = { padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '0.375rem', textDecoration: 'none', color: '#333', fontSize: '0.875rem' }
const dangerBtn: React.CSSProperties = { padding: '0.5rem 1rem', backgroundColor: '#fff', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }
