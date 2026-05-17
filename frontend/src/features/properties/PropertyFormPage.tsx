import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, ContentCard, Field, PageHeader, PageLayout, TextArea, TextInput } from '@/components/ui/Page'
import { useCreateProperty, useProperty, useUpdateProperty } from './api'
import type { AxiosError } from 'axios'
import type { ValidationErrorResponse } from '@/types/api'

export default function PropertyFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()

  const { data: existing, isLoading } = useProperty(Number(id))
  const createMutation = useCreateProperty()
  const updateMutation = useUpdateProperty(Number(id))

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [initialized, setInitialized] = useState(false)

  if (isEdit && existing && !initialized) {
    setName(existing.name)
    setAddress(existing.address)
    setDescription(existing.description || '')
    setInitialized(true)
  }

  if (isEdit && isLoading) {
    return (
      <PageLayout width="narrow">
        <PageHeader title="Property" description="Loading property form..." backTo="/properties" backLabel="Back to Properties" />
        <ContentCard>Loading...</ContentCard>
      </PageLayout>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ name, address, description: description || null })
      } else {
        await createMutation.mutateAsync({ name, address, description: description || undefined })
      }
      navigate('/properties')
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
        eyebrow="Property"
        title={isEdit ? 'Edit Property' : 'Create Property'}
        description={isEdit ? 'Update property details used across units, bookings and operations.' : 'Create a property before adding units and managing bookings.'}
        backTo="/properties"
        backLabel="Back to Properties"
      />

      <ContentCard>
        <form onSubmit={handleSubmit}>
          <Field label="Name" htmlFor="name" required error={errors.name?.[0]}>
            <TextInput id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
          </Field>

          <Field label="Address" htmlFor="address" required error={errors.address?.[0]}>
            <TextInput id="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={255} />
          </Field>

          <Field label="Description" htmlFor="description" error={errors.description?.[0]}>
            <TextArea id="description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} />
          </Field>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button type="submit" disabled={isPending} variant="primary">
              {isPending ? 'Saving...' : isEdit ? 'Update Property' : 'Create Property'}
            </Button>
            <Button type="button" onClick={() => navigate('/properties')}>Cancel</Button>
          </div>
        </form>
      </ContentCard>
    </PageLayout>
  )
}
