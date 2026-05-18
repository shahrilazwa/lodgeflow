import { useParams, useNavigate } from 'react-router-dom'
import { Button, ButtonLink, ContentCard, PageHeader, PageLayout, StatusBadge } from '@/components/ui/Page'
import { useBooking, useCheckInBooking, useCheckOutBooking, useCancelBooking } from './api'
import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS } from './types'
import PaymentSection from '@/features/payments/PaymentSection'

type Tone = 'success' | 'danger' | 'warning' | 'neutral' | 'info'

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: booking, isLoading, error } = useBooking(Number(id))
  const checkIn = useCheckInBooking()
  const checkOut = useCheckOutBooking()
  const cancel = useCancelBooking()

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader title="Booking" description="Loading booking details..." backTo="/bookings" backLabel="Back to Bookings" />
        <ContentCard>Loading booking...</ContentCard>
      </PageLayout>
    )
  }

  if (error || !booking) {
    return (
      <PageLayout>
        <PageHeader title="Booking unavailable" backTo="/bookings" backLabel="Back to Bookings" />
        <ContentCard><p style={{ margin: 0, color: '#dc2626' }}>Unable to load this booking record.</p></ContentCard>
      </PageLayout>
    )
  }

  const outstanding = Math.max(0, Number(booking.total_amount) - Number(booking.net_paid_amount))
  const overpaid = Math.max(0, Number(booking.net_paid_amount) - Number(booking.total_amount))

  async function handleCheckIn() {
    await checkIn.mutateAsync(booking.id)
    navigate(`/bookings/${booking.id}`)
  }

  async function handleCheckOut() {
    await checkOut.mutateAsync(booking.id)
    navigate(`/bookings/${booking.id}`)
  }

  async function handleCancel() {
    if (confirm('Are you sure you want to cancel this booking?')) {
      await cancel.mutateAsync(booking.id)
      navigate(`/bookings/${booking.id}`)
    }
  }

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Booking"
        title={`Booking #${booking.id}`}
        description="Review stay details, payment state and booking workflow actions."
        backTo="/bookings"
        backLabel="Back to Bookings"
        meta={
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <StatusBadge tone={bookingStatusTone(booking.status)}>{BOOKING_STATUS_LABELS[booking.status]}</StatusBadge>
            <StatusBadge tone={paymentStatusTone(booking.payment_status)}>{PAYMENT_STATUS_LABELS[booking.payment_status]}</StatusBadge>
          </div>
        }
      />

      <ContentCard>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
          <DetailItem label="Guest" value={booking.guest?.full_name || '—'} />
          <DetailItem label="Unit" value={booking.unit?.name || '—'} />
          <DetailItem label="Check-in" value={booking.check_in_date} />
          <DetailItem label="Check-out" value={booking.check_out_date} />
          <DetailItem label="Total Amount" value={`RM ${Number(booking.total_amount).toFixed(2)}`} />
          <DetailItem label="Net Paid" value={`RM ${Number(booking.net_paid_amount).toFixed(2)}`} />
        </div>

        {outstanding > 0 && <Notice tone="warning" label="Outstanding Balance" value={`RM ${outstanding.toFixed(2)}`} />}
        {overpaid > 0 && <Notice tone="info" label="Overpaid" value={`RM ${overpaid.toFixed(2)}`} />}
      </ContentCard>

      <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {booking.status === 'confirmed' && (
          <>
            <Button type="button" variant="primary" onClick={handleCheckIn} disabled={checkIn.isPending}>{checkIn.isPending ? 'Processing...' : 'Check In'}</Button>
            <ButtonLink to={`/bookings/${booking.id}/edit`}>Edit</ButtonLink>
            <Button type="button" variant="danger" onClick={handleCancel} disabled={cancel.isPending}>{cancel.isPending ? 'Cancelling...' : 'Cancel Booking'}</Button>
          </>
        )}
        {booking.status === 'checked_in' && (
          <>
            <Button type="button" variant="primary" onClick={handleCheckOut} disabled={checkOut.isPending}>{checkOut.isPending ? 'Processing...' : 'Check Out'}</Button>
            <Button type="button" variant="danger" onClick={handleCancel} disabled={cancel.isPending}>{cancel.isPending ? 'Cancelling...' : 'Cancel Booking'}</Button>
          </>
        )}
      </div>

      {(checkIn.error || checkOut.error || cancel.error) && <p style={{ marginTop: '10px', color: '#dc2626', fontSize: '0.85rem' }}>Status transition failed. The booking may not be in the correct state.</p>}

      <PaymentSection bookingId={booking.id} />
    </PageLayout>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ margin: '0 0 4px', color: '#71717a', fontSize: '0.78rem', fontWeight: 700 }}>{label}</p>
      <p style={{ margin: 0, color: '#18181b', fontSize: '0.9rem', lineHeight: 1.6 }}>{value}</p>
    </div>
  )
}

function Notice({ tone, label, value }: { tone: 'warning' | 'info'; label: string; value: string }) {
  const style = tone === 'warning'
    ? { background: '#fffbeb', color: '#b45309' }
    : { background: '#eff6ff', color: '#2563eb' }
  return <div style={{ marginTop: '16px', padding: '10px 12px', borderRadius: '10px', fontSize: '0.86rem', fontWeight: 700, ...style }}>{label}: {value}</div>
}

function bookingStatusTone(status: string): Tone {
  const tones: Record<string, Tone> = { confirmed: 'info', checked_in: 'success', checked_out: 'neutral', cancelled: 'danger' }
  return tones[status] ?? 'neutral'
}

function paymentStatusTone(status: string): Tone {
  const tones: Record<string, Tone> = { unpaid: 'danger', partial: 'warning', paid: 'success', overpaid: 'info', refunded: 'neutral' }
  return tones[status] ?? 'neutral'
}
