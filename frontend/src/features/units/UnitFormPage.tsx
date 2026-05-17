import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [initialized, setInitialized] = useState(false)

  // Populate form when editing
  if (isEdit && existing && !initialized) {
    setName(existing.name)
    setType(existing.type)
    setDescription(existing.description || '')
    setInitialized(true)
  }

  if (isEdit && isLoading) return <div>Loading...</div>

  const backPath = isEdit && existing
    ? `/properties/${existing.property_id}/units`
    : `/properties/${propertyId}/units`

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ name, type, description: description || null })
        navigate(`/properties/${existing?.property_id}/units`)
      } else {
        await createMutation.mutateAsync({ name, type, description: description || undefined })
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
    <div style={{ maxWidth: '500px' }}>
      <div style={{ marginBottom: '1rem' }}>
        <a href={backPath} onClick={(e) => { e.preventDefault(); navigate(backPath) }} style={{ color: '#555', fontSize: '0.875rem' }}>← Back to Units</a>
      </div>

      <h2>{isEdit ? 'Edit Unit' : 'Create Unit'}</h2>

      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label htmlFor="name" style={labelStyle}>Name *</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} maxLength={100} />
          {errors.name && <p style={errorStyle}>{errors.name[0]}</p>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="type" style={labelStyle}>Type *</label>
          <select id="type" value={type} onChange={(e) => setType(e.target.value as UnitType)} style={inputStyle}>
            {UNIT_TYPES.map((t) => (
              <option key={t} value={t}>{UNIT_TYPE_LABELS[t]}</option>
            ))}
          </select>
          {errors.type && <p style={errorStyle}>{errors.type[0]}</p>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="description" style={labelStyle}>Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, minHeight: '80px' }} maxLength={500} />
          {errors.description && <p style={errorStyle}>{errors.description[0]}</p>}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" disabled={isPending} style={submitBtnStyle}>
            {isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
          <button type="button" onClick={() => navigate(backPath)} style={cancelBtnStyle}>Cancel</button>
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
