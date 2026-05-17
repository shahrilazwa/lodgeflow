import { useState } from 'react'
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
      await createMutation.mutateAsync({
        type,
        amount: Number(amount),
        payment_date: paymentDate,
        payment_method: paymentMethod,
      })
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
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0 }}>Payments</h3>
        <button type="button" onClick={() => setShowForm(!showForm)} style={toggleBtnStyle}>
          {showForm ? 'Cancel' : '+ Record Payment'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <label style={labelStyle}>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as PaymentType)} style={inputStyle}>
                <option value="payment">Payment</option>
                <option value="refund">Refund</option>
              </select>
              {errors.type && <p style={errorStyle}>{errors.type[0]}</p>}
            </div>
            <div>
              <label style={labelStyle}>Amount (RM)</label>
              <input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} style={inputStyle} required />
              {errors.amount && <p style={errorStyle}>{errors.amount[0]}</p>}
            </div>
            <div>
              <label style={labelStyle}>Date</label>
              <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} style={inputStyle} required />
              {errors.payment_date && <p style={errorStyle}>{errors.payment_date[0]}</p>}
            </div>
            <div>
              <label style={labelStyle}>Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} style={inputStyle}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" disabled={createMutation.isPending} style={submitBtnStyle}>
            {createMutation.isPending ? 'Saving...' : 'Record'}
          </button>
        </form>
      )}

      {isLoading && <p>Loading payments...</p>}

      {payments && payments.length === 0 && !showForm && (
        <p style={{ color: '#888', fontSize: '0.875rem' }}>No payments recorded yet.</p>
      )}

      {payments && payments.length > 0 && (
        <table style={tableStyle}>
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
            {payments.map((p: Payment) => (
              <tr key={p.id}>
                <td style={tdStyle}>{p.payment_date}</td>
                <td style={tdStyle}>
                  <span style={p.type === 'refund' ? refundBadge : paymentBadge}>{p.type}</span>
                </td>
                <td style={tdStyle}>RM {Number(p.amount).toFixed(2)}</td>
                <td style={tdStyle}>{PAYMENT_METHOD_LABELS[p.payment_method]}</td>
                <td style={tdStyle}>
                  <button type="button" onClick={() => handleDelete(p.id)} style={deleteBtnStyle}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const formStyle: React.CSSProperties = { border: '1px solid #e0e0e0', borderRadius: '0.375rem', padding: '1rem', marginBottom: '1rem', backgroundColor: '#fafafa' }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.2rem' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.4rem', border: '1px solid #ccc', borderRadius: '0.25rem', fontSize: '0.85rem', boxSizing: 'border-box' }
const errorStyle: React.CSSProperties = { color: '#dc3545', fontSize: '0.75rem', margin: '0.2rem 0 0' }
const submitBtnStyle: React.CSSProperties = { marginTop: '0.75rem', padding: '0.4rem 1rem', backgroundColor: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.85rem' }
const toggleBtnStyle: React.CSSProperties = { padding: '0.3rem 0.75rem', backgroundColor: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8rem' }
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }
const thStyle: React.CSSProperties = { textAlign: 'left', padding: '0.4rem', borderBottom: '1px solid #ddd', fontSize: '0.75rem', color: '#888' }
const tdStyle: React.CSSProperties = { padding: '0.4rem', borderBottom: '1px solid #eee' }
const paymentBadge: React.CSSProperties = { backgroundColor: '#d4edda', color: '#155724', padding: '0.1rem 0.3rem', borderRadius: '0.2rem', fontSize: '0.7rem' }
const refundBadge: React.CSSProperties = { backgroundColor: '#f8d7da', color: '#721c24', padding: '0.1rem 0.3rem', borderRadius: '0.2rem', fontSize: '0.7rem' }
const deleteBtnStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }
