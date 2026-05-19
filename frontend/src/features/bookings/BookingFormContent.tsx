import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, ContentCard, Field, PageHeader, PageLayout, TextInput } from '@/components/ui/Page'
import { useCreateBooking, useUpdateBooking } from './api'
import { useGuests } from '@/features/guests/api'
import { useProperties } from '@/features/properties/api'
import { useUnitsForProperty } from '@/features/units/api'
import { UNIT_TYPE_LABELS } from '@/features/units/types'
import type { Booking } from './types'
import type { AxiosError } from 'axios'
import type { ValidationErrorResponse, ApiErrorResponse } from '@/types/api'

interface BookingFormContentProps {
  existing?: Booking
}

export default function BookingFormContent({ existing }: BookingFormContentProps) {
  const isEdit = !!existing
  const navigate = useNavigate()

  const createMutation = useCreateBooking()
  const updateMutation = useUpdateBooking(existing?.id ?? 0)
  const { data: guests } = useGuests()
  const { data: properties } = useProperties()

  const [propertyId, setPropertyId] = useState('')
  const selectedPropertyId = Number(propertyId)
  const { data: units, isLoading: loadingUnits } = useUnitsForProperty(selectedPropertyId)

  const [unitId, setUnitId] = useState(existing ? String(existing.unit_id) : '')
  const [guestId, setGuestId] = useState(existing ? String(existing.guest_id) : '')
  const [checkInDate, setCheckInDate] = useState(normalizeDateInput(existing?.check_in_date))
  const [checkOutDate, setCheckOutDate] = useState(normalizeDateInput(existing?.check_out_date))
  const [totalAmount, setTotalAmount] = useState(existing?.total_amount ?? '')
  const [allowCustomerCancellation, setAllowCustomerCancellation] = useState(existing?.allow_customer_cancellation ?? false)
  const [allowCustomerModification, setAllowCustomerModification] = useState(existing?.allow_customer_modification ?? false)
  const [totalManuallyEdited, setTotalManuallyEdited] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState('')

  const selectedUnit = useMemo(() => units?.find((unit) => String(unit.id) === unitId), [units, unitId])
  const pricePerNight = selectedUnit?.price_per_night ?? existing?.unit?.price_per_night ?? null
  const minimumCheckOutDate = getNextDateString(checkInDate)
  const nights = calculateNights(checkInDate, checkOutDate)
  const invalidDateRange = Boolean(checkInDate && checkOutDate && nights <= 0)
  const calculatedTotal = pricePerNight && nights > 0
    ? (Number(pricePerNight) * nights).toFixed(2)
    : ''
  const effectiveTotalAmount = !totalManuallyEdited && calculatedTotal ? calculatedTotal : totalAmount

  function handleCheckInDateChange(value: string) {
    setCheckInDate(value)
    setTotalManuallyEdited(false)

    const nextDate = getNextDateString(value)
    if (nextDate && (!checkOutDate || checkOutDate <= value)) {
      setCheckOutDate(nextDate)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setGeneralError('')

    const policyFlags = {
      allow_customer_cancellation: allowCustomerCancellation,
      allow_customer_modification: allowCustomerModification,
    }

    try {
      if (isEdit && existing) {
        await updateMutation.mutateAsync({ check_in_date: checkInDate, check_out_date: checkOutDate, total_amount: Number(effectiveTotalAmount), ...policyFlags })
      } else {
        await createMutation.mutateAsync({ unit_id: Number(unitId), guest_id: Number(guestId), check_in_date: checkInDate, check_out_date: checkOutDate, total_amount: Number(effectiveTotalAmount), ...policyFlags })
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
    <PageLayout width="narrow">
      <PageHeader
        eyebrow="Booking"
        title={isEdit ? 'Edit Booking' : 'Create Booking'}
        description={isEdit ? 'Update stay dates, booking amount and customer-facing policy.' : 'Create a booking by selecting a guest, property, unit and stay dates.'}
        backTo="/bookings"
        backLabel="Back to Bookings"
      />

      {generalError && <ContentCard><p style={{ margin: 0, color: '#dc2626' }}>{generalError}</p></ContentCard>}

      <ContentCard>
        <form onSubmit={handleSubmit}>
          {!isEdit && (
            <>
              <Field label="Guest" htmlFor="guest_id" required error={errors.guest_id?.[0]}>
                <select id="guest_id" value={guestId} onChange={(e) => setGuestId(e.target.value)} className="ui-input" required>
                  <option value="">Select a guest...</option>
                  {guests?.map((guest) => <option key={guest.id} value={guest.id}>{guest.full_name} ({guest.phone})</option>)}
                </select>
              </Field>

              <Field label="Property" htmlFor="property_id" required>
                <select
                  id="property_id"
                  value={propertyId}
                  onChange={(e) => {
                    setPropertyId(e.target.value)
                    setUnitId('')
                    setTotalManuallyEdited(false)
                  }}
                  className="ui-input"
                  required
                >
                  <option value="">Select a property...</option>
                  {properties?.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}
                </select>
              </Field>

              <Field label="Unit" htmlFor="unit_id" required error={errors.unit_id?.[0]}>
                <select
                  id="unit_id"
                  value={unitId}
                  onChange={(e) => {
                    setUnitId(e.target.value)
                    setTotalManuallyEdited(false)
                  }}
                  className="ui-input"
                  required
                  disabled={!propertyId || loadingUnits}
                >
                  <option value="">{propertyId ? (loadingUnits ? 'Loading units...' : 'Select a unit...') : 'Select a property first...'}</option>
                  {units?.filter((unit) => unit.is_active).map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} - {UNIT_TYPE_LABELS[unit.type]}{unit.price_per_night ? ` - RM ${Number(unit.price_per_night).toFixed(2)} / night` : ''}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          )}

          <Field label="Check-in Date" htmlFor="check_in_date" required error={errors.check_in_date?.[0]}>
            <TextInput id="check_in_date" type="date" value={checkInDate} onChange={(e) => handleCheckInDateChange(e.target.value)} required />
          </Field>

          <Field label="Check-out Date" htmlFor="check_out_date" required error={errors.check_out_date?.[0] || (invalidDateRange ? 'Check-out date must be after check-in date.' : undefined)}>
            <TextInput id="check_out_date" type="date" value={checkOutDate} min={minimumCheckOutDate} onChange={(e) => { setCheckOutDate(e.target.value); setTotalManuallyEdited(false) }} required />
          </Field>

          {pricePerNight && nights > 0 && (
            <div style={{ marginBottom: '16px', padding: '10px 12px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', fontSize: '0.84rem', fontWeight: 700 }}>
              Auto-calculated: {nights} night{nights === 1 ? '' : 's'} at RM {Number(pricePerNight).toFixed(2)} per night = RM {calculatedTotal}
            </div>
          )}

          <Field label="Total Amount (RM)" htmlFor="total_amount" required error={errors.total_amount?.[0]}>
            <TextInput id="total_amount" type="number" step="0.01" min="0.01" value={effectiveTotalAmount} onChange={(e) => { setTotalAmount(e.target.value); setTotalManuallyEdited(true) }} required />
          </Field>

          <CustomerPolicyCheckboxes
            allowCustomerCancellation={allowCustomerCancellation}
            allowCustomerModification={allowCustomerModification}
            onCancellationChange={setAllowCustomerCancellation}
            onModificationChange={setAllowCustomerModification}
          />

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button type="submit" disabled={isPending || invalidDateRange} variant="primary">{isPending ? 'Saving...' : isEdit ? 'Update Booking' : 'Create Booking'}</Button>
            <Button type="button" onClick={() => navigate('/bookings')}>Cancel</Button>
          </div>
        </form>
      </ContentCard>
    </PageLayout>
  )
}

function CustomerPolicyCheckboxes({ allowCustomerCancellation, allowCustomerModification, onCancellationChange, onModificationChange }: {
  allowCustomerCancellation: boolean
  allowCustomerModification: boolean
  onCancellationChange: (value: boolean) => void
  onModificationChange: (value: boolean) => void
}) {
  return (
    <div style={{ marginBottom: '18px', display: 'grid', gap: '10px' }}>
      <p style={{ margin: 0, color: '#71717a', fontSize: '0.78rem', lineHeight: 1.5 }}>
        These options apply only to future customer-facing confirmation links. They do not block staff actions in this dashboard.
      </p>
      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={allowCustomerCancellation} onChange={(e) => onCancellationChange(e.target.checked)} />
        <span>Allow customer cancellation from customer link</span>
      </label>
      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={allowCustomerModification} onChange={(e) => onModificationChange(e.target.checked)} />
        <span>Allow customer modification request from customer link</span>
      </label>
    </div>
  )
}

const checkboxLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  color: '#18181b',
  fontSize: '0.86rem',
  fontWeight: 700,
}

function calculateNights(checkInDate: string, checkOutDate: string): number {
  const normalizedCheckIn = normalizeDateInput(checkInDate)
  const normalizedCheckOut = normalizeDateInput(checkOutDate)
  if (!normalizedCheckIn || !normalizedCheckOut) return 0

  const checkIn = new Date(`${normalizedCheckIn}T00:00:00`)
  const checkOut = new Date(`${normalizedCheckOut}T00:00:00`)
  const diffMs = checkOut.getTime() - checkIn.getTime()

  if (diffMs <= 0) return 0

  return Math.round(diffMs / 86400000)
}

function getNextDateString(dateString: string): string | undefined {
  const normalizedDate = normalizeDateInput(dateString)
  if (!normalizedDate) return undefined

  const date = new Date(`${normalizedDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return undefined

  date.setDate(date.getDate() + 1)

  return date.toISOString().slice(0, 10)
}

function normalizeDateInput(dateString?: string | null): string {
  if (!dateString) return ''

  return dateString.slice(0, 10)
}
