import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ButtonLink, ContentCard, EmptyState, PageHeader, PageLayout, StatusBadge, TextInput } from '@/components/ui/Page'
import { usePayments } from './api'
import { PAYMENT_METHOD_LABELS, PAYMENT_METHODS, PAYMENT_TYPE_LABELS, PAYMENT_TYPES } from './types'
import type { Payment, PaymentFilters } from './types'

export default function PaymentsPage() {
  const [filters, setFilters] = useState<PaymentFilters>({})
  const { data: payments, isLoading, error } = usePayments(filters)

  if (error) {
    return (
      <PageLayout>
        <PageHeader title="Payments" description="Review payment and refund records across bookings." />
        <ContentCard><p style={{ margin: 0, color: '#dc2626' }}>Error loading payments.</p></ContentCard>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Payments"
        title="Payments"
        description="Review payment and refund records across bookings. New payments are still recorded from the related booking detail page."
        action={<ButtonLink to="/bookings" variant="primary">Go to Bookings</ButtonLink>}
      />

      <ContentCard>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={filters.type || ''}
            onChange={(e) => setFilters({ ...filters, type: e.target.value as PaymentFilters['type'] || undefined })}
            className="ui-input"
            style={{ maxWidth: '180px' }}
          >
            <option value="">All Types</option>
            {PAYMENT_TYPES.map((type) => <option key={type} value={type}>{PAYMENT_TYPE_LABELS[type]}</option>)}
          </select>

          <select
            value={filters.payment_method || ''}
            onChange={(e) => setFilters({ ...filters, payment_method: e.target.value as PaymentFilters['payment_method'] || undefined })}
            className="ui-input"
            style={{ maxWidth: '220px' }}
          >
            <option value="">All Methods</option>
            {PAYMENT_METHODS.map((method) => <option key={method} value={method}>{PAYMENT_METHOD_LABELS[method]}</option>)}
          </select>

          <TextInput
            type="number"
            min="1"
            placeholder="Booking ID"
            value={filters.booking_id || ''}
            onChange={(e) => setFilters({ ...filters, booking_id: e.target.value || undefined })}
            style={{ maxWidth: '150px' }}
          />

          <TextInput
            type="date"
            value={filters.from_date || ''}
            onChange={(e) => setFilters({ ...filters, from_date: e.target.value || undefined })}
            style={{ maxWidth: '180px' }}
          />

          <TextInput
            type="date"
            value={filters.to_date || ''}
            onChange={(e) => setFilters({ ...filters, to_date: e.target.value || undefined })}
            style={{ maxWidth: '180px' }}
          />
        </div>
      </ContentCard>

      {isLoading && <ContentCard>Loading payments...</ContentCard>}

      {payments && payments.length === 0 && (
        <EmptyState
          title="No payments found"
          description="Record a payment from a booking detail page or adjust the filters to review other records."
          action={<ButtonLink to="/bookings" variant="primary">Go to Bookings</ButtonLink>}
        />
      )}

      {payments && payments.length > 0 && (
        <ContentCard>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Booking</th>
                  <th style={thStyle}>Guest</th>
                  <th style={thStyle}>Unit</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Method</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment: Payment) => (
                  <tr key={payment.id}>
                    <td style={tdStyle}>{formatDate(payment.payment_date)}</td>
                    <td style={tdStyle}>
                      <Link to={`/bookings/${payment.booking_id}`} style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
                        #{payment.booking_id}
                      </Link>
                    </td>
                    <td style={tdStyle}>{payment.booking?.guest?.full_name || '—'}</td>
                    <td style={tdStyle}>{payment.booking?.unit?.name || '—'}</td>
                    <td style={tdStyle}><StatusBadge tone={payment.type === 'refund' ? 'danger' : 'success'}>{PAYMENT_TYPE_LABELS[payment.type]}</StatusBadge></td>
                    <td style={tdStyle}>RM {Number(payment.amount).toFixed(2)}</td>
                    <td style={tdStyle}>{PAYMENT_METHOD_LABELS[payment.payment_method]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ContentCard>
      )}
    </PageLayout>
  )
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-MY', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

const thStyle: React.CSSProperties = { textAlign: 'left', padding: '10px 8px', borderBottom: '1px solid #e4e4e7', color: '#71717a', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }
const tdStyle: React.CSSProperties = { padding: '12px 8px', borderBottom: '1px solid #f4f4f5', color: '#18181b', whiteSpace: 'nowrap' }
