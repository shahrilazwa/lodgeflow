import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, ContentCard, Field, PageHeader, PageLayout, TextInput } from '@/components/ui/Page'
import { useCreateBooking, useBooking, useUpdateBooking } from './api'
import { useGuests } from '@/features/guests/api'
import { useProperties } from '@/features/properties/api'
import { useUnitsForProperty } from '@/features/units/api'
import { UNIT_TYPE_LABELS } from '@/features/units/types'
import type { AxiosError } from 'axios'
import type { ValidationErrorResponse, ApiErrorResponse } from '@/types/api'

export default function BookingFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()

  const { data: existing, isLoading: loadingBooking } = useBooking(Number(id))
  const createMutation = useCreateBooking()
  const updateMutation = useUpdateBooking(Number(id))
  const { data: guests } = useGuests()
  const { data: properties } = useProperties()

  const [propertyId, setPropertyId] = useState('')
  const selectedPropertyId = Number(propertyId)
  const { data: units, isLoading: loadingUnits } = useUnitsForProperty(selectedPropertyId)

  const [unitId, setUnitId] = useState('')
  const [guestId, setGuestId] = useState('')
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [totalManuallyEdited, setTotalManuallyEdited] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState('')
  const [initialized, setInitialized] = useState(false)

  const selectedUnit = useMemo(() => units?.find((unit) => String(unit.id) === unitId), [units, unitId])
  const nights = calculateNights(checkInDate, checkOutDate)
  const calculatedTotal = selectedUnit?.price_per_night && nights > 0
    ? (Number(selectedUnit.price_per_night) * nights).toFixed(2)
    : ''

  useEffect(() => {
    if (!isEdit && !totalManuallyEdited && calculatedTotal) {
      setTotalAmount(calculatedTotal)
    }
  }, [calculatedTotal, isEdit, totalManuallyEdited])

  if (isEdit && existing && !initialized) {
    setUnitId(String(existing.unit_id))
    setGuestId(String(existing.guest_id))
    setCheckInDate(existing.check_in_date)
    setCheckOutDate(existing.check_out_date)
    setTotalAmount(existing.total_amount)
    setInitialized(true)
  }

  if (isEdit && loadingBooking) {
    return (
      <PageLayout width="narrow">
        <PageHeader title="Booking" description="Loading booking form..." backTo="/bookings" backLabel="Back to Bookings" />
        <ContentCard>Loading...</ContentCard>
      </PageLayout>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setGeneralError('')

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ check_in_date: checkInDate, check_out_date: checkOutDate, total_amount: Number(totalAmount) })
      } else {
        await createMutation.mutateAsync({ unit_id: Number(unitId), guest_id: Number(guestId), check_in_date: checkInDate, check_out_date: checkOutDate, total_amount: Number(totalAmount) })
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
        description={isEdit ? 'Update stay dates and booking amount.' : 'Create a booking by selecting a guest, property, unit and stay dates.'}
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
            <TextInput id="check_in_date" type="date" value={checkInDate} onChange={(e) => { setCheckInDate(e.target.value); setTotalManuallyEdited(false) }} required />
          </Field>

          <Field label="Check-out Date" htmlFor="check_out_date" required error={errors.check_out_date?.[0]}>
            <TextInput id="check_out_date" type="date" value={checkOutDate} onChange={(e) => { setCheckOutDate(e.target.value); setTotalManuallyEdited(false) }} required />
          </Field>

          {!isEdit && selectedUnit?.price_per_night && nights > 0 && (
            <div style={{ marginBottom: '16px', padding: '10px 12px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', fontSize: '0.84rem', fontWeight: 700 }}>
              Auto-calculated: {nights} night{nights === 1 ? '' : 's'} at RM {Number(selectedUnit.price_per_night).toFixed(2)} per night = RM {calculatedTotal}
            </div>
          )}

          <Field label="Total Amount (RM)" htmlFor="total_amount" required error={errors.total_amount?.[0]}>
            <TextInput id="total_amount" type="number" step="0.01" min="0.01" value={totalAmount} onChange={(e) => { setTotalAmount(e.target.value); setTotalManuallyEdited(true) }} required />
          </Field>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button type="submit" disabled={isPending} variant="primary">{isPending ? 'Saving...' : isEdit ? 'Update Booking' : 'Create Booking'}</Button>
            <Button type="button" onClick={() => navigate('/bookings')}>Cancel</Button>
          </div>
        </form>
      </ContentCard>
    </PageLayout>
  )
}

function calculateNights(checkInDate: string, checkOutDate: string): number {
  if (!checkInDate || !checkOutDate) return 0

  const checkIn = new Date(`${checkInDate}T00:00:00`)
  const checkOut = new Date(`${checkOutDate}T00:00:00`)
  const diffMs = checkOut.getTime() - checkIn.getTime()

  if (diffMs <= 0) return 0

  return Math.round(diffMs / 86400000)
}
