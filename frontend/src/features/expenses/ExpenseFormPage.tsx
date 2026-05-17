import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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

  if (isEdit && isLoading) return <div>Loading...</div>

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
    <div style={{ maxWidth: '500px' }}>
      <h2>{isEdit ? 'Edit Expense' : 'Create Expense'}</h2>

      {generalError && <div style={alertStyle}>{generalError}</div>}

      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label htmlFor="amount" style={labelStyle}>Amount (RM) *</label>
          <input id="amount" type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} style={inputStyle} required />
          {errors.amount && <p style={errorStyle}>{errors.amount[0]}</p>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="date" style={labelStyle}>Date *</label>
          <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} required />
          {errors.date && <p style={errorStyle}>{errors.date[0]}</p>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="category" style={labelStyle}>Category *</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} style={inputStyle} required>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{EXPENSE_CATEGORY_LABELS[c]}</option>
            ))}
          </select>
          {errors.category && <p style={errorStyle}>{errors.category[0]}</p>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="property_id" style={labelStyle}>Property *</label>
          <select id="property_id" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} style={inputStyle} required>
            <option value="">Select property...</option>
            {properties?.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {errors.property_id && <p style={errorStyle}>{errors.property_id[0]}</p>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="service_provider_id" style={labelStyle}>Service Provider (optional)</label>
          <select id="service_provider_id" value={serviceProviderId} onChange={(e) => setServiceProviderId(e.target.value)} style={inputStyle}>
            <option value="">None</option>
            {serviceProviders?.map((sp) => (
              <option key={sp.id} value={sp.id}>{sp.name}</option>
            ))}
          </select>
        </div>

        <div style={fieldStyle}>
          <label htmlFor="description" style={labelStyle}>Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, minHeight: '60px' }} maxLength={500} />
          {errors.description && <p style={errorStyle}>{errors.description[0]}</p>}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" disabled={isPending} style={submitBtnStyle}>{isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}</button>
          <button type="button" onClick={() => navigate('/expenses')} style={cancelBtnStyle}>Cancel</button>
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
