import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, ContentCard, Field, PageHeader, PageLayout, TextArea, TextInput } from '@/components/ui/Page'
import FacilitySelector from '@/features/facilities/FacilitySelector'
import { useFacilities } from '@/features/facilities/api'
import { useCreateUnit, useUnit, useUpdateUnit } from './api'
import { BED_TYPES, BED_TYPE_DEFAULT_CAPACITY, BED_TYPE_LABELS, UNIT_TYPES, UNIT_TYPE_LABELS } from './types'
import UnitPhotoGallery from './UnitPhotoGallery'
import type { BedType, OccupancySource, UnitBed, UnitType } from './types'
import type { AxiosError } from 'axios'
import type { ValidationErrorResponse } from '@/types/api'

type EditableBed = Omit<UnitBed, 'id' | 'unit_id'>

export default function UnitFormPage() {
  const { propertyId, id } = useParams<{ propertyId?: string; id?: string }>()
  const isEdit = !!id
  const navigate = useNavigate()

  const { data: existing, isLoading } = useUnit(Number(id))
  const { data: facilities } = useFacilities()
  const createMutation = useCreateUnit(Number(propertyId))
  const updateMutation = useUpdateUnit(Number(id))

  const [name, setName] = useState('')
  const [type, setType] = useState<UnitType>('room')
  const [pricePerNight, setPricePerNight] = useState('')
  const [description, setDescription] = useState('')
  const [occupancySource, setOccupancySource] = useState<OccupancySource>('calculated')
  const [manualOccupancy, setManualOccupancy] = useState('')
  const [beds, setBeds] = useState<EditableBed[]>([])
  const [facilityIds, setFacilityIds] = useState<number[]>([])
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [initialized, setInitialized] = useState(false)

  if (isEdit && existing && !initialized) {
    setName(existing.name)
    setType(existing.type)
    setPricePerNight(existing.price_per_night || '')
    setDescription(existing.description || '')
    setOccupancySource(existing.occupancy_source || 'calculated')
    setManualOccupancy(existing.max_occupancy ? String(existing.max_occupancy) : '')
    setBeds(existing.beds?.map((bed) => ({
      bed_type: bed.bed_type,
      quantity: bed.quantity,
      capacity_per_bed: bed.capacity_per_bed,
    })) ?? [])
    setFacilityIds(existing.facilities?.map((facility) => facility.id) ?? [])
    setInitialized(true)
  }

  const calculatedOccupancy = useMemo(() => beds.reduce((total, bed) => total + Number(bed.quantity || 0) * Number(bed.capacity_per_bed || 0), 0), [beds])
  const maxOccupancy = occupancySource === 'manual'
    ? (manualOccupancy ? Number(manualOccupancy) : null)
    : (calculatedOccupancy > 0 ? calculatedOccupancy : null)

  const backPath = isEdit && existing
    ? `/properties/${existing.property_id}/units`
    : `/properties/${propertyId}/units`

  if (isEdit && isLoading) {
    return (
      <PageLayout>
        <PageHeader title="Unit" description="Loading unit form..." backTo={backPath} backLabel="Back to Units" />
        <ContentCard>Loading...</ContentCard>
      </PageLayout>
    )
  }

  function addBed() {
    setBeds([...beds, { bed_type: 'queen', quantity: 1, capacity_per_bed: BED_TYPE_DEFAULT_CAPACITY.queen }])
  }

  function updateBed(index: number, changes: Partial<EditableBed>) {
    setBeds(beds.map((bed, currentIndex) => {
      if (currentIndex !== index) return bed
      const nextBed = { ...bed, ...changes }
      if (changes.bed_type) {
        nextBed.capacity_per_bed = BED_TYPE_DEFAULT_CAPACITY[changes.bed_type]
      }
      return nextBed
    }))
  }

  function removeBed(index: number) {
    setBeds(beds.filter((_, currentIndex) => currentIndex !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const payload = {
      name,
      type,
      description: description || null,
      price_per_night: pricePerNight ? Number(pricePerNight) : null,
      max_occupancy: maxOccupancy,
      occupancy_source: occupancySource,
      beds,
      facility_ids: facilityIds,
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(payload)
        navigate(`/properties/${existing?.property_id}/units`)
      } else {
        await createMutation.mutateAsync({ ...payload, description: description || undefined })
        navigate(`/properties/${propertyId}/units`)
      }
    } catch (err) {
      const axiosErr = err as AxiosError<ValidationErrorResponse>
      if (axiosErr.response?.status === 422 && axiosErr.response.data.errors) {
        setErrors(axiosErr.response.data.errors)
      }
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Unit"
        title={isEdit ? 'Edit Unit' : 'Create Unit'}
        description={isEdit ? 'Update unit details, photos, type, nightly price, bed setup and facilities.' : 'Create a room, bed, hall or whole-house unit under this property.'}
        backTo={backPath}
        backLabel="Back to Units"
      />

      {isEdit && existing && (
        <div style={{ marginBottom: '14px' }}>
          <UnitPhotoGallery unitId={existing.id} photos={existing.photos} />
        </div>
      )}

      <ContentCard>
        <form onSubmit={handleSubmit}>
          <Field label="Name" htmlFor="name" required error={errors.name?.[0]}>
            <TextInput id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
          </Field>

          <Field label="Type" htmlFor="type" required error={errors.type?.[0]}>
            <select id="type" value={type} onChange={(e) => setType(e.target.value as UnitType)} className="ui-input">
              {UNIT_TYPES.map((t) => (
                <option key={t} value={t}>{UNIT_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </Field>

          <Field label="Price Per Night (RM)" htmlFor="price_per_night" error={errors.price_per_night?.[0]}>
            <TextInput id="price_per_night" type="number" step="0.01" min="0" value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)} />
          </Field>

          <Field label="Bed Setup" htmlFor="bed_setup" error={errors.beds?.[0]}>
            <div style={{ display: 'grid', gap: '10px' }}>
              {beds.length === 0 && <p style={{ margin: 0, color: '#71717a', fontSize: '0.84rem' }}>No beds added yet.</p>}
              {beds.map((bed, index) => (
                <div key={`${bed.bed_type}-${index}`} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 110px auto', gap: '8px', alignItems: 'end' }}>
                  <select value={bed.bed_type} onChange={(e) => updateBed(index, { bed_type: e.target.value as BedType })} className="ui-input" aria-label="Bed type">
                    {BED_TYPES.map((bedType) => <option key={bedType} value={bedType}>{BED_TYPE_LABELS[bedType]}</option>)}
                  </select>
                  <TextInput type="number" min="1" max="99" value={bed.quantity} onChange={(e) => updateBed(index, { quantity: Number(e.target.value) })} aria-label="Quantity" />
                  <TextInput type="number" min="1" max="20" value={bed.capacity_per_bed} onChange={(e) => updateBed(index, { capacity_per_bed: Number(e.target.value) })} aria-label="Capacity per bed" />
                  <Button type="button" size="sm" variant="danger" onClick={() => removeBed(index)}>Remove</Button>
                </div>
              ))}
              <div>
                <Button type="button" size="sm" onClick={addBed}>+ Add Bed</Button>
              </div>
            </div>
          </Field>

          <Field label="Occupancy" htmlFor="occupancy_source" error={errors.max_occupancy?.[0] || errors.occupancy_source?.[0]}>
            <div style={{ display: 'grid', gap: '10px' }}>
              <select id="occupancy_source" value={occupancySource} onChange={(e) => setOccupancySource(e.target.value as OccupancySource)} className="ui-input">
                <option value="calculated">Calculated from bed setup</option>
                <option value="manual">Manual override</option>
              </select>
              {occupancySource === 'manual' && (
                <TextInput type="number" min="1" max="999" value={manualOccupancy} onChange={(e) => setManualOccupancy(e.target.value)} placeholder="Maximum guests" />
              )}
              <p style={{ margin: 0, color: '#71717a', fontSize: '0.84rem' }}>
                Calculated occupancy: <strong>{calculatedOccupancy || 0}</strong>. Saved max occupancy: <strong>{maxOccupancy ?? 'Not set'}</strong>.
              </p>
            </div>
          </Field>

          <Field label="Description" htmlFor="description" error={errors.description?.[0]}>
            <TextArea id="description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
          </Field>

          <Field label="Facilities" htmlFor="facilities" error={errors.facility_ids?.[0]}>
            <FacilitySelector facilities={facilities} selectedIds={facilityIds} onChange={setFacilityIds} scope="unit" />
          </Field>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button type="submit" disabled={isPending} variant="primary">
              {isPending ? 'Saving...' : isEdit ? 'Update Unit' : 'Create Unit'}
            </Button>
            <Button type="button" onClick={() => navigate(backPath)}>Cancel</Button>
          </div>
        </form>
      </ContentCard>
    </PageLayout>
  )
}
