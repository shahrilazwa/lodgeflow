import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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

  // Populate form when editing
  if (isEdit && existing && !initialized) {
    setFullName(existing.full_name)
    setPhone(existing.phone)
    setEmail(existing.email || '')
    setIdentificationNumber(existing.identification_number || '')
    setInitialized(true)
  }

  if (isEdit && isLoading) return <div>Loading...</div>

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
    <div style={{ maxWidth: '500px' }}>
      <h2>{isEdit ? 'Edit Guest' : 'Create Guest'}</h2>

      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label htmlFor="full_name" style={labelStyle}>Full Name *</label>
          <input id="full_name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} maxLength={100} required />
          {errors.full_name && <p style={errorStyle}>{errors.full_name[0]}</p>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="phone" style={labelStyle}>Phone (7–15 digits) *</label>
          <input id="phone" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} maxLength={15} required pattern="\d{7,15}" />
          {errors.phone && <p style={errorStyle}>{errors.phone[0]}</p>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="email" style={labelStyle}>Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} maxLength={254} />
          {errors.email && <p style={errorStyle}>{errors.email[0]}</p>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="identification_number" style={labelStyle}>Identification Number</label>
          <input id="identification_number" type="text" value={identificationNumber} onChange={(e) => setIdentificationNumber(e.target.value)} style={inputStyle} maxLength={50} />
          {errors.identification_number && <p style={errorStyle}>{errors.identification_number[0]}</p>}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" disabled={isPending} style={submitBtnStyle}>
            {isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
          <button type="button" onClick={() => navigate('/guests')} style={cancelBtnStyle}>Cancel</button>
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
