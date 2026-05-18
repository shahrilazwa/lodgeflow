import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, ContentCard, Field, PageHeader, PageLayout, TextArea, TextInput } from '@/components/ui/Page'
import { useCreateUnit, useUnit, useUpdateUnit } from './api'
import { UNIT_TYPES, UNIT_TYPE_LABELS } from './types'
import type { UnitType } from './types'
import type { AxiosError } from 'axios'
import type { ValidationErrorResponse } from '@/types/api'

export default function UnitFormPage() {
  const { propertyId, id } = useParams<{ propertyId?: string; id?: string }>()
  const isEdit = !!id
  const navigate = useNavigate()

  const { data: existing, isLoading } = useUnit(Number(id))
  const createMutation = useCreateUnit(Number(propertyId))
  const updateMutation = useUpdateUnit(Number(id))

  const [name, setName] = useState('')
  const [type, setType] = useState<UnitType>('room')
  const [pricePerNight, setPricePerNight] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [initialized, setInitialized] = useState(false)

  if (isEdit && existing && !initialized) {
    setName(existing.name)
    setType(existing.type)
    setPricePerNight(existing.price_per_night || '')
    setDescription(existing.description || '')
    setInitialized(true)
  }

  const backPath = isEdit && existing
    ? `/properties/${existing.property_id}/units`
    : `/properties/${propertyId}/units`

  if (isEdit && isLoading) {
    return (
      <PageLayout width="narrow">
        <PageHeader title="Unit" description="Loading unit form..." backTo={backPath} backLabel="Back to Units" />
        <ContentCard>Loading...</ContentCard>
      </PageLayout>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const payload = {
      name,
      type,
      description: description || null,
      price_per_night: pricePerNight ? Number(pricePerNight) : null,
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
    <PageLayout width="narrow">
      <PageHeader
        eyebrow="Unit"
        title={isEdit ? 'Edit Unit' : 'Create Unit'}
        description={isEdit ? 'Update unit details, type and nightly price.' : 'Create a room, bed, hall or whole-house unit under this property.'}
        backTo={backPath}
        backLabel="Back to Units"
      />

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

          <Field label="Description" htmlFor="description" error={errors.description?.[0]}>
            <TextArea id="description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
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
