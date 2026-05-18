import { useState } from 'react'
import { Button, ContentCard, Field, StatusBadge, TextInput } from '@/components/ui/Page'
import { usePaymentsForBooking, useCreatePayment, useDeletePayment } from './api'
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from './types'
import type { PaymentType, PaymentMethod, Payment } from './types'
import type { AxiosError } from 'axios'
import type { ValidationErrorResponse } from '@/types/api'

interface PaymentSectionProps {
  bookingId: number
}

export default function PaymentSection({ bookingId }: PaymentSectionProps) {
  const { data: payments, isLoading } = usePaymentsForBooking(bookingId)
  const createMutation = useCreatePayment(bookingId)
  const deleteMutation = useDeletePayment(bookingId)

  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState<PaymentType>('payment')
  const [amount, setAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0] ?? '')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    try {
      await createMutation.mutateAsync({ type, amount: Number(amount), payment_date: paymentDate, payment_method: paymentMethod })
      setShowForm(false)
      setAmount('')
      setType('payment')
    } catch (err) {
      const axiosErr = err as AxiosError<ValidationErrorResponse>
      if (axiosErr.response?.status === 422 && axiosErr.response.data?.errors) {
        setErrors(axiosErr.response.data.errors)
      }
    }
  }

  async function handleDelete(paymentId: number) {
    if (confirm('Delete this payment record?')) {
      await deleteMutation.mutateAsync(paymentId)
    }
  }

  return (
    <div style={{ marginTop: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#18181b', fontSize: '1rem', fontWeight: 800 }}>Payments</h2>
          <p style={{ margin: '4px 0 0', color: '#71717a', fontSize: '0.82rem' }}>Record payments and refunds for this booking.</p>
        </div>
        <Button type="button" size="sm" variant={showForm ? 'secondary' : 'primary'} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Record Payment'}
        </Button>
      </div>

      {showForm && (
        <ContentCard>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
              <Field label="Type" htmlFor="payment_type" error={errors.type?.[0]}>
                <select id="payment_type" value={type} onChange={(e) => setType(e.target.value as PaymentType)} className="ui-input">
                  <option value="payment">Payment</option>
                  <option value="refund">Refund</option>
                </select>
              </Field>

              <Field label="Amount (RM)" htmlFor="payment_amount" error={errors.amount?.[0]}>
                <TextInput id="payment_amount" type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </Field>

              <Field label="Date" htmlFor="payment_date" error={errors.payment_date?.[0]}>
                <TextInput id="payment_date" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} required />
              </Field>

              <Field label="Method" htmlFor="payment_method">
                <select id="payment_method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="ui-input">
                  {PAYMENT_METHODS.map((method) => <option key={method} value={method}>{PAYMENT_METHOD_LABELS[method]}</option>)}
                </select>
              </Field>
            </div>

            <Button type="submit" disabled={createMutation.isPending} variant="primary">
              {createMutation.isPending ? 'Saving...' : 'Record Payment'}
            </Button>
          </form>
        </ContentCard>
      )}

      {isLoading && <ContentCard>Loading payments...</ContentCard>}

      {payments && payments.length === 0 && !showForm && (
        <ContentCard>
          <p style={{ margin: 0, color: '#71717a', fontSize: '0.88rem' }}>No payments recorded yet.</p>
        </ContentCard>
      )}

      {payments && payments.length > 0 && (
        <ContentCard>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Method</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment: Payment) => (
                  <tr key={payment.id}>
                    <td style={tdStyle}>{payment.payment_date}</td>
                    <td style={tdStyle}><StatusBadge tone={payment.type === 'refund' ? 'danger' : 'success'}>{payment.type}</StatusBadge></td>
                    <td style={tdStyle}>RM {Number(payment.amount).toFixed(2)}</td>
                    <td style={tdStyle}>{PAYMENT_METHOD_LABELS[payment.payment_method]}</td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <Button type="button" size="sm" variant="danger" onClick={() => handleDelete(payment.id)}>Remove</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ContentCard>
      )}
    </div>
  )
}

const thStyle: React.CSSProperties = { textAlign: 'left', padding: '10px 8px', borderBottom: '1px solid #e4e4e7', color: '#71717a', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }
const tdStyle: React.CSSProperties = { padding: '10px 8px', borderBottom: '1px solid #f4f4f5', color: '#18181b' }
