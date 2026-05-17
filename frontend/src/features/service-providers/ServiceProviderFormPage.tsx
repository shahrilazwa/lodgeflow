import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCreateServiceProvider, useServiceProvider, useUpdateServiceProvider } from './api'
import type { AxiosError } from 'axios'
import type { ValidationErrorResponse } from '@/types/api'

export default function ServiceProviderFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()

  const { data: existing, isLoading } = useServiceProvider(Number(id))
  const createMutation = useCreateServiceProvider()
  const updateMutation = useUpdateServiceProvider(Number(id))

  const [name, setName] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [initialized, setInitialized] = useState(false)

  if (isEdit && existing && !initialized) {
    setName(existing.name)
    setServiceType(existing.service_type)
    setPhone(existing.phone || '')
    setNotes(existing.notes || '')
    setInitialized(true)
  }

  if (isEdit && isLoading) return <div>Loading...</div>

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const payload = {
      name,
      service_type: serviceType,
      phone: phone || undefined,
      notes: notes || undefined,
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(payload)
      } else {
        await createMutation.mutateAsync(payload)
      }
      navigate('/service-providers')
    } catch (err) {
      const axiosErr = err as AxiosError<ValidationErrorResponse>
      if (axiosErr.response?.status === 422 && axiosErr.response.data?.errors) {
        setErrors(axiosErr.response.data.errors)
      }
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div style={{ maxWidth: '500px' }}>
      <h2>{isEdit ? 'Edit Service Provider' : 'Create Service Provider'}</h2>
      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label htmlFor="name" style={labelStyle}>Name *</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} maxLength={100} required />
          {errors.name && <p style={errorStyle}>{errors.name[0]}</p>}
        </div>
        <div style={fieldStyle}>
          <label htmlFor="service_type" style={labelStyle}>Service Type *</label>
          <input id="service_type" type="text" value={serviceType} onChange={(e) => setServiceType(e.target.value)} style={inputStyle} maxLength={100} required />
          {errors.service_type && <p style={errorStyle}>{errors.service_type[0]}</p>}
        </div>
        <div style={fieldStyle}>
          <label htmlFor="phone" style={labelStyle}>Phone</label>
          <input id="phone" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} maxLength={20} />
        </div>
        <div style={fieldStyle}>
          <label htmlFor="notes" style={labelStyle}>Notes</label>
          <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ ...inputStyle, minHeight: '80px' }} maxLength={1000} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" disabled={isPending} style={submitBtnStyle}>{isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}</button>
          <button type="button" onClick={() => navigate('/service-providers')} style={cancelBtnStyle}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

const fieldStyle: React.CSSProperties = { marginBottom: '1rem' }
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem', fontSize: '0.875rem', boxSizing: 'border-box' }
const errorStyle: React.CSSProperties = { color: '#dc3545', fontSize: '0.8rem', margin: '0.25rem 0 0' }
const submitBtnStyle: React.CSSProperties = { padding: '0.5rem 1.5rem', backgroundColor: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }
const cancelBtnStyle: React.CSSProperties = { padding: '0.5rem 1.5rem', backgroundColor: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }
