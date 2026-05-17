import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCreateBooking, useBooking, useUpdateBooking } from './api'
import { useProperties } from '@/features/properties/api'
import { useGuests } from '@/features/guests/api'
import type { AxiosError } from 'axios'
import type { ValidationErrorResponse, ApiErrorResponse } from '@/types/api'

export default function BookingFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()

  const { data: existing, isLoading: loadingBooking } = useBooking(Number(id))
  const createMutation = useCreateBooking()
  const updateMutation = useUpdateBooking(Number(id))

  // Load properties and guests for selectors
  const { data: properties } = useProperties()
  const { data: guests } = useGuests()

  const [unitId, setUnitId] = useState('')
  const [guestId, setGuestId] = useState('')
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState('')
  const [initialized, setInitialized] = useState(false)

  // Populate form when editing
  if (isEdit && existing && !initialized) {
    setUnitId(String(existing.unit_id))
    setGuestId(String(existing.guest_id))
    setCheckInDate(existing.check_in_date)
    setCheckOutDate(existing.check_out_date)
    setTotalAmount(existing.total_amount)
    setInitialized(true)
  }

  if (isEdit && loadingBooking) return <div>Loading...</div>

  // Get units from all properties for the selector
  // In a real app, you'd filter units by selected property
  const allUnits = properties?.flatMap((p) => {
    // We don't have units loaded here — use a simple approach
    return [{ id: p.id, name: p.name }]
  }) || []
  void allUnits // suppress unused warning — we'll use unit_id directly

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setGeneralError('')

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          check_in_date: checkInDate,
          check_out_date: checkOutDate,
          total_amount: Number(totalAmount),
        })
      } else {
        await createMutation.mutateAsync({
          unit_id: Number(unitId),
          guest_id: Number(guestId),
          check_in_date: checkInDate,
          check_out_date: checkOutDate,
          total_amount: Number(totalAmount),
        })
      }
      navigate('/bookings')
    } catch (err) {
      const axiosErr = err as AxiosError<ValidationErrorResponse & ApiErrorResponse>
      if (axiosErr.response?.status === 422 && axiosErr.response.data?.errors) {
        setErrors(axiosErr.response.data.errors)
      } else if (axiosErr.response?.status === 409) {
        setGeneralError('Booking dates overlap with an existing booking for this unit.')
      } else if (axiosErr.response?.data?.message) {
        setGeneralError(axiosErr.response.data.message)
      } else {
        setGeneralError('An unexpected error occurred.')
      }
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div style={{ maxWidth: '500px' }}>
      <h2>{isEdit ? 'Edit Booking' : 'Create Booking'}</h2>

      {generalError && <div style={alertStyle}>{generalError}</div>}

      <form onSubmit={handleSubmit}>
        {!isEdit && (
          <>
            <div style={fieldStyle}>
              <label htmlFor="guest_id" style={labelStyle}>Guest *</label>
              <select id="guest_id" value={guestId} onChange={(e) => setGuestId(e.target.value)} style={inputStyle} required>
                <option value="">Select a guest...</option>
                {guests?.map((g) => (
                  <option key={g.id} value={g.id}>{g.full_name} ({g.phone})</option>
                ))}
              </select>
              {errors.guest_id && <p style={errorStyle}>{errors.guest_id[0]}</p>}
            </div>

            <div style={fieldStyle}>
              <label htmlFor="unit_id" style={labelStyle}>Unit ID *</label>
              <input id="unit_id" type="number" value={unitId} onChange={(e) => setUnitId(e.target.value)} style={inputStyle} required min={1} />
              <p style={{ margin: '0.25rem 0 0', color: '#888', fontSize: '0.75rem' }}>Enter the unit ID number. View units from the Properties page.</p>
              {errors.unit_id && <p style={errorStyle}>{errors.unit_id[0]}</p>}
            </div>
          </>
        )}

        <div style={fieldStyle}>
          <label htmlFor="check_in_date" style={labelStyle}>Check-in Date *</label>
          <input id="check_in_date" type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} style={inputStyle} required />
          {errors.check_in_date && <p style={errorStyle}>{errors.check_in_date[0]}</p>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="check_out_date" style={labelStyle}>Check-out Date *</label>
          <input id="check_out_date" type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} style={inputStyle} required />
          {errors.check_out_date && <p style={errorStyle}>{errors.check_out_date[0]}</p>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="total_amount" style={labelStyle}>Total Amount (RM) *</label>
          <input id="total_amount" type="number" step="0.01" min="0.01" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} style={inputStyle} required />
          {errors.total_amount && <p style={errorStyle}>{errors.total_amount[0]}</p>}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" disabled={isPending} style={submitBtnStyle}>
            {isPending ? 'Saving...' : isEdit ? 'Update' : 'Create Booking'}
          </button>
          <button type="button" onClick={() => navigate('/bookings')} style={cancelBtnStyle}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

const fieldStyle: React.CSSProperties = { marginBottom: '1rem' }
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem', fontSize: '0.875rem', boxSizing: 'border-box' }
const errorStyle: React.CSSProperties = { color: '#dc3545', fontSize: '0.8rem', margin: '0.25rem 0 0' }
const alertStyle: React.CSSProperties = { backgroundColor: '#f8d7da', color: '#721c24', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }
const submitBtnStyle: React.CSSProperties = { padding: '0.5rem 1.5rem', backgroundColor: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }
const cancelBtnStyle: React.CSSProperties = { padding: '0.5rem 1.5rem', backgroundColor: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }
