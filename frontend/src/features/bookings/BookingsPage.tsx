import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ButtonLink, ContentCard, EmptyState, PageHeader, PageLayout, StatusBadge, TextInput } from '@/components/ui/Page'
import { useBookings } from './api'
import { BOOKING_STATUSES, BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS } from './types'
import type { Booking, BookingFilters } from './types'

export default function BookingsPage() {
  const [filters, setFilters] = useState<BookingFilters>({})
  const { data: bookings, isLoading, error } = useBookings(filters)

  if (error) {
    return (
      <PageLayout>
        <PageHeader title="Bookings" description="Manage reservations and booking status." />
        <ContentCard><p style={{ margin: 0, color: '#dc2626' }}>Error loading bookings.</p></ContentCard>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <PageHeader eyebrow="Bookings" title="Bookings" description="Manage reservations, stay dates and guest workflow." action={<ButtonLink to="/bookings/create" variant="primary">+ New Booking</ButtonLink>} />

      <ContentCard>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select value={filters.status || ''} onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })} className="ui-input" style={{ maxWidth: '220px' }}>
            <option value="">All Statuses</option>
            {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{BOOKING_STATUS_LABELS[s]}</option>)}
          </select>
          <TextInput type="date" value={filters.from_date || ''} onChange={(e) => setFilters({ ...filters, from_date: e.target.value || undefined })} style={{ maxWidth: '180px' }} />
          <TextInput type="date" value={filters.to_date || ''} onChange={(e) => setFilters({ ...filters, to_date: e.target.value || undefined })} style={{ maxWidth: '180px' }} />
        </div>
      </ContentCard>

      {isLoading && <ContentCard>Loading bookings...</ContentCard>}
      {bookings && bookings.length === 0 && <EmptyState title="No bookings found" description="Create a new booking or adjust the filters to review other booking records." action={<ButtonLink to="/bookings/create" variant="primary">+ New Booking</ButtonLink>} />}

      <div style={{ display: 'grid', gap: '14px', marginTop: '14px' }}>
        {bookings?.map((booking: Booking) => (
          <ContentCard key={booking.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
              <div>
                <Link to={`/bookings/${booking.id}`} style={{ textDecoration: 'none', color: '#18181b' }}>
                  <h2 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 800 }}>{booking.guest?.full_name || 'Guest'} — {booking.unit?.name || 'Unit'}</h2>
                </Link>
                <p style={{ margin: 0, color: '#52525b', fontSize: '0.86rem' }}>{booking.check_in_date} → {booking.check_out_date}</p>
                <p style={{ margin: '6px 0 0', color: '#18181b', fontSize: '0.86rem', fontWeight: 700 }}>RM {Number(booking.total_amount).toFixed(2)}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                <StatusBadge tone={bookingStatusTone(booking.status)}>{BOOKING_STATUS_LABELS[booking.status]}</StatusBadge>
                <StatusBadge tone={paymentStatusTone(booking.payment_status)}>{PAYMENT_STATUS_LABELS[booking.payment_status]}</StatusBadge>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}><ButtonLink to={`/bookings/${booking.id}`} size="sm">View</ButtonLink></div>
          </ContentCard>
        ))}
      </div>
    </PageLayout>
  )
}

type Tone = 'success' | 'danger' | 'warning' | 'neutral' | 'info'

function bookingStatusTone(status: string): Tone {
  const tones: Record<string, Tone> = { confirmed: 'info', checked_in: 'success', checked_out: 'neutral', cancelled: 'danger' }
  return tones[status] ?? 'neutral'
}

function paymentStatusTone(status: string): Tone {
  const tones: Record<string, Tone> = { unpaid: 'danger', partial: 'warning', paid: 'success', overpaid: 'info', refunded: 'neutral' }
  return tones[status] ?? 'neutral'
}
