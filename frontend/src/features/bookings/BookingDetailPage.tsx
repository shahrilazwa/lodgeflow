import { useParams, useNavigate } from 'react-router-dom'
import { Button, ButtonLink, ContentCard, PageHeader, PageLayout, StatusBadge } from '@/components/ui/Page'
import { useBooking, useConfirmBooking, useCheckInBooking, useCheckOutBooking, useCancelBooking } from './api'
import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS } from './types'
import PaymentSection from '@/features/payments/PaymentSection'

type Tone = 'success' | 'danger' | 'warning' | 'neutral' | 'info'

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: booking, isLoading, error } = useBooking(Number(id))
  const confirmBooking = useConfirmBooking()
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

  const bookingId = booking.id
  const outstanding = Math.max(0, Number(booking.total_amount) - Number(booking.net_paid_amount))
  const overpaid = Math.max(0, Number(booking.net_paid_amount) - Number(booking.total_amount))
  const transitionError = getTransitionError(confirmBooking.error || checkIn.error || checkOut.error || cancel.error)

  async function handleConfirm() {
    await confirmBooking.mutateAsync(bookingId)
    navigate(`/bookings/${bookingId}`)
  }

  async function handleCheckIn() {
    await checkIn.mutateAsync(bookingId)
    navigate(`/bookings/${bookingId}`)
  }

  async function handleCheckOut() {
    await checkOut.mutateAsync(bookingId)
    navigate(`/bookings/${bookingId}`)
  }

  async function handleCancel() {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      await cancel.mutateAsync(bookingId)
      navigate(`/bookings/${bookingId}`)
    }
  }

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Booking"
        title={`Booking #${bookingId}`}
        description="Review stay details, payment state and booking workflow actions."
        backTo="/bookings"
        backLabel="Back to Bookings"
        meta={
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <StatusBadge tone={bookingStatusTone(booking.status)}>{bookingStatusLabel(booking.status)}</StatusBadge>
            <StatusBadge tone={paymentStatusTone(booking.payment_status)}>{paymentStatusLabel(booking.payment_status)}</StatusBadge>
          </div>
        }
      />

      {booking.status === 'pending_customer_confirmation' && (
        <ContentCard>
          <p style={{ margin: '0 0 6px', color: '#b45309', fontSize: '0.88rem', fontWeight: 800 }}>Waiting for customer confirmation</p>
          <p style={{ margin: 0, color: '#71717a', fontSize: '0.86rem', lineHeight: 1.6 }}>
            Confirm this booking only after the customer has agreed to the stay dates, unit and amount. Check-in is disabled until the booking is confirmed.
          </p>
        </ContentCard>
      )}

      <ContentCard>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
          <DetailItem label="Guest" value={booking.guest?.full_name || '—'} />
          <DetailItem label="Unit" value={booking.unit?.name || '—'} />
          <DetailItem label="Check-in" value={formatDate(booking.check_in_date)} />
          <DetailItem label="Check-out" value={formatDate(booking.check_out_date)} />
          <DetailItem label="Total Amount" value={`RM ${Number(booking.total_amount).toFixed(2)}`} />
          <DetailItem label="Net Paid" value={`RM ${Number(booking.net_paid_amount).toFixed(2)}`} />
        </div>

        {outstanding > 0 && <Notice tone="warning" label="Outstanding Balance" value={`RM ${outstanding.toFixed(2)}`} />}
        {overpaid > 0 && <Notice tone="info" label="Overpaid" value={`RM ${overpaid.toFixed(2)}`} />}
      </ContentCard>

      <ContentCard>
        <p style={{ margin: '0 0 10px', color: '#18181b', fontSize: '0.9rem', fontWeight: 800 }}>Customer policy</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <PolicyChip allowed={booking.allow_customer_cancellation} label="Customer cancellation" />
          <PolicyChip allowed={booking.allow_customer_modification} label="Customer modification" />
        </div>
        <p style={{ margin: '10px 0 0', color: '#71717a', fontSize: '0.8rem', lineHeight: 1.5 }}>
          These settings are for future customer-facing confirmation links. Staff can still manage the booking from this dashboard.
        </p>
      </ContentCard>

      <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {booking.status === 'pending_customer_confirmation' && (
          <>
            <Button type="button" variant="primary" onClick={handleConfirm} disabled={confirmBooking.isPending}>{confirmBooking.isPending ? 'Confirming...' : 'Confirm Booking'}</Button>
            <ButtonLink to={`/bookings/${bookingId}/edit`}>Edit</ButtonLink>
            <Button type="button" variant="danger" onClick={handleCancel} disabled={cancel.isPending}>{cancel.isPending ? 'Cancelling...' : 'Cancel Booking'}</Button>
          </>
        )}
        {booking.status === 'confirmed' && (
          <>
            <Button type="button" variant="primary" onClick={handleCheckIn} disabled={checkIn.isPending}>{checkIn.isPending ? 'Processing...' : 'Check In'}</Button>
            <ButtonLink to={`/bookings/${bookingId}/edit`}>Edit</ButtonLink>
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

      {transitionError && <p style={{ marginTop: '10px', color: '#dc2626', fontSize: '0.85rem' }}>{transitionError}</p>}

      <PaymentSection bookingId={bookingId} />
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

function PolicyChip({ allowed, label }: { allowed: boolean; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', minHeight: '28px', borderRadius: '999px', background: allowed ? '#ecfdf5' : '#f4f4f5', color: allowed ? '#047857' : '#52525b', fontSize: '0.76rem', fontWeight: 800, padding: '0 10px' }}>
      {label}: {allowed ? 'Allowed' : 'Not allowed'}
    </span>
  )
}

function bookingStatusTone(status: string): Tone {
  const tones: Record<string, Tone> = { pending_customer_confirmation: 'warning', confirmed: 'info', checked_in: 'success', checked_out: 'neutral', cancelled: 'danger' }
  return tones[status] ?? 'neutral'
}

function paymentStatusTone(status: string): Tone {
  const tones: Record<string, Tone> = { unpaid: 'danger', partial: 'warning', paid: 'success', overpaid: 'info', refunded: 'neutral' }
  return tones[status] ?? 'neutral'
}

function bookingStatusLabel(status: string): string {
  return BOOKING_STATUS_LABELS[status as keyof typeof BOOKING_STATUS_LABELS] ?? humanizeStatus(status)
}

function paymentStatusLabel(status: string): string {
  return PAYMENT_STATUS_LABELS[status as keyof typeof PAYMENT_STATUS_LABELS] ?? humanizeStatus(status)
}

function humanizeStatus(status: string): string {
  if (!status) return 'Unknown Status'
  return status.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-MY', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

function getTransitionError(error: unknown): string {
  if (!error || typeof error !== 'object') return ''
  const maybeAxiosError = error as { response?: { data?: { message?: string } } }
  return maybeAxiosError.response?.data?.message || 'Status transition failed. The booking may not be in the correct state.'
}
