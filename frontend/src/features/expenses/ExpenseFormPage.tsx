import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, ContentCard, Field, PageHeader, PageLayout, TextArea, TextInput } from '@/components/ui/Page'
import { useCreateExpense, useExpense, useUpdateExpense } from './api'
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS } from './types'
import { useProperties } from '@/features/properties/api'
import { useServiceProviders } from '@/features/service-providers/api'
import type { ExpenseCategory } from './types'
import type { AxiosError } from 'axios'
import type { ValidationErrorResponse } from '@/types/api'

export default function ExpenseFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()

  const { data: existing, isLoading } = useExpense(Number(id))
  const createMutation = useCreateExpense()
  const updateMutation = useUpdateExpense(Number(id))
  const { data: properties } = useProperties()
  const { data: serviceProviders } = useServiceProviders()

  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0] ?? '')
  const [category, setCategory] = useState<ExpenseCategory>('other')
  const [propertyId, setPropertyId] = useState('')
  const [description, setDescription] = useState('')
  const [serviceProviderId, setServiceProviderId] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState('')
  const [initialized, setInitialized] = useState(false)

  if (isEdit && existing && !initialized) {
    setAmount(existing.amount)
    setDate(existing.date)
    setCategory(existing.category)
    setPropertyId(String(existing.property_id))
    setDescription(existing.description || '')
    setServiceProviderId(existing.service_provider_id ? String(existing.service_provider_id) : '')
    setInitialized(true)
  }

  if (isEdit && isLoading) {
    return (
      <PageLayout width="narrow">
        <PageHeader title="Expense" description="Loading expense form..." backTo="/expenses" backLabel="Back to Expenses" />
        <ContentCard>Loading...</ContentCard>
      </PageLayout>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setGeneralError('')

    const payload = {
      amount: Number(amount),
      date,
      category,
      property_id: Number(propertyId),
      description: description || undefined,
      service_provider_id: serviceProviderId ? Number(serviceProviderId) : undefined,
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(payload)
      } else {
        await createMutation.mutateAsync(payload)
      }
      navigate('/expenses')
    } catch (err) {
      const axiosErr = err as AxiosError<ValidationErrorResponse>
      if (axiosErr.response?.status === 422 && axiosErr.response.data?.errors) {
        setErrors(axiosErr.response.data.errors)
      } else if (axiosErr.response?.data?.message) {
        setGeneralError(axiosErr.response.data.message)
      }
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <PageLayout width="narrow">
      <PageHeader
        eyebrow="Expense"
        title={isEdit ? 'Edit Expense' : 'Create Expense'}
        description={isEdit ? 'Update expense amount, category and related property.' : 'Record a new cost against a property or service provider.'}
        backTo="/expenses"
        backLabel="Back to Expenses"
      />

      {generalError && <ContentCard><p style={{ margin: 0, color: '#dc2626' }}>{generalError}</p></ContentCard>}

      <ContentCard>
        <form onSubmit={handleSubmit}>
          <Field label="Amount (RM)" htmlFor="amount" required error={errors.amount?.[0]}>
            <TextInput id="amount" type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </Field>

          <Field label="Date" htmlFor="date" required error={errors.date?.[0]}>
            <TextInput id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </Field>

          <Field label="Category" htmlFor="category" required error={errors.category?.[0]}>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} className="ui-input" required>
              {EXPENSE_CATEGORIES.map((expenseCategory) => <option key={expenseCategory} value={expenseCategory}>{EXPENSE_CATEGORY_LABELS[expenseCategory]}</option>)}
            </select>
          </Field>

          <Field label="Property" htmlFor="property_id" required error={errors.property_id?.[0]}>
            <select id="property_id" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="ui-input" required>
              <option value="">Select property...</option>
              {properties?.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}
            </select>
          </Field>

          <Field label="Service Provider" htmlFor="service_provider_id">
            <select id="service_provider_id" value={serviceProviderId} onChange={(e) => setServiceProviderId(e.target.value)} className="ui-input">
              <option value="">None</option>
              {serviceProviders?.map((serviceProvider) => <option key={serviceProvider.id} value={serviceProvider.id}>{serviceProvider.name}</option>)}
            </select>
          </Field>

          <Field label="Description" htmlFor="description" error={errors.description?.[0]}>
            <TextArea id="description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
          </Field>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button type="submit" disabled={isPending} variant="primary">{isPending ? 'Saving...' : isEdit ? 'Update Expense' : 'Create Expense'}</Button>
            <Button type="button" onClick={() => navigate('/expenses')}>Cancel</Button>
          </div>
        </form>
      </ContentCard>
    </PageLayout>
  )
}
