import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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

  // Populate form when editing
  if (isEdit && existing && !initialized) {
    setName(existing.name)
    setAddress(existing.address)
    setDescription(existing.description || '')
    setInitialized(true)
  }

  if (isEdit && isLoading) return <div>Loading...</div>

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
    <div style={{ maxWidth: '500px' }}>
      <h2>{isEdit ? 'Edit Property' : 'Create Property'}</h2>

      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label htmlFor="name" style={labelStyle}>Name *</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} maxLength={100} />
          {errors.name && <p style={errorStyle}>{errors.name[0]}</p>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="address" style={labelStyle}>Address *</label>
          <input id="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} style={inputStyle} maxLength={255} />
          {errors.address && <p style={errorStyle}>{errors.address[0]}</p>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="description" style={labelStyle}>Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, minHeight: '80px' }} maxLength={1000} />
          {errors.description && <p style={errorStyle}>{errors.description[0]}</p>}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" disabled={isPending} style={submitBtnStyle}>
            {isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
          <button type="button" onClick={() => navigate('/properties')} style={cancelBtnStyle}>Cancel</button>
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
