import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, ContentCard, Field, PageHeader, PageLayout, TextInput } from '@/components/ui/Page'
import { useCreateGuest, useGuest, useUpdateGuest } from './api'
import type { AxiosError } from 'axios'
import type { ValidationErrorResponse } from '@/types/api'

export default function GuestFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()

  const { data: existing, isLoading } = useGuest(Number(id))
  const createMutation = useCreateGuest()
  const updateMutation = useUpdateGuest(Number(id))

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [identificationNumber, setIdentificationNumber] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [initialized, setInitialized] = useState(false)

  if (isEdit && existing && !initialized) {
    setFullName(existing.full_name)
    setPhone(existing.phone)
    setEmail(existing.email || '')
    setIdentificationNumber(existing.identification_number || '')
    setInitialized(true)
  }

  if (isEdit && isLoading) {
    return (
      <PageLayout width="narrow">
        <PageHeader title="Guest" description="Loading guest form..." backTo="/guests" backLabel="Back to Guests" />
        <ContentCard>Loading...</ContentCard>
      </PageLayout>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const payload = {
      full_name: fullName,
      phone,
      email: email || undefined,
      identification_number: identificationNumber || undefined,
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(payload)
      } else {
        await createMutation.mutateAsync(payload)
      }
      navigate('/guests')
    } catch (err) {
      const axiosErr = err as AxiosError<ValidationErrorResponse>
      if (axiosErr.response?.status === 422 && axiosErr.response.data?.errors) {
        setErrors(axiosErr.response.data.errors)
      }
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <PageLayout width="narrow">
      <PageHeader
        eyebrow="Guest"
        title={isEdit ? 'Edit Guest' : 'Create Guest'}
        description={isEdit ? 'Update guest contact and identification details.' : 'Create a guest profile to use when recording bookings.'}
        backTo="/guests"
        backLabel="Back to Guests"
      />

      <ContentCard>
        <form onSubmit={handleSubmit}>
          <Field label="Full Name" htmlFor="full_name" required error={errors.full_name?.[0]}>
            <TextInput id="full_name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} required />
          </Field>

          <Field label="Phone" htmlFor="phone" required error={errors.phone?.[0]}>
            <TextInput id="phone" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={15} required pattern="\d{7,15}" />
          </Field>

          <Field label="Email" htmlFor="email" error={errors.email?.[0]}>
            <TextInput id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} />
          </Field>

          <Field label="Identification Number" htmlFor="identification_number" error={errors.identification_number?.[0]}>
            <TextInput id="identification_number" type="text" value={identificationNumber} onChange={(e) => setIdentificationNumber(e.target.value)} maxLength={50} />
          </Field>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button type="submit" disabled={isPending} variant="primary">
              {isPending ? 'Saving...' : isEdit ? 'Update Guest' : 'Create Guest'}
            </Button>
            <Button type="button" onClick={() => navigate('/guests')}>Cancel</Button>
          </div>
        </form>
      </ContentCard>
    </PageLayout>
  )
}
