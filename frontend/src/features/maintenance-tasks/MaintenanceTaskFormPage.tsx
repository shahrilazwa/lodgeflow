import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCreateMaintenanceTask, useMaintenanceTask, useUpdateMaintenanceTask } from './api'
import { MT_PRIORITIES, MT_PRIORITY_LABELS, MT_STATUSES, MT_STATUS_LABELS } from './types'
import { useProperties } from '@/features/properties/api'
import { useServiceProviders } from '@/features/service-providers/api'
import type { MTPriority, MTStatus } from './types'
import type { AxiosError } from 'axios'
import type { ValidationErrorResponse } from '@/types/api'

export default function MaintenanceTaskFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()

  const { data: existing, isLoading } = useMaintenanceTask(Number(id))
  const createMutation = useCreateMaintenanceTask()
  const updateMutation = useUpdateMaintenanceTask(Number(id))
  const { data: properties } = useProperties()
  const { data: serviceProviders } = useServiceProviders()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<MTPriority>('medium')
  const [status, setStatus] = useState<MTStatus>('open')
  const [propertyId, setPropertyId] = useState('')
  const [serviceProviderId, setServiceProviderId] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState('')
  const [initialized, setInitialized] = useState(false)

  if (isEdit && existing && !initialized) {
    setTitle(existing.title)
    setDescription(existing.description || '')
    setPriority(existing.priority)
    setStatus(existing.status)
    setPropertyId(existing.property_id ? String(existing.property_id) : '')
    setServiceProviderId(existing.service_provider_id ? String(existing.service_provider_id) : '')
    setScheduledDate(existing.scheduled_date || '')
    setInitialized(true)
  }

  if (isEdit && isLoading) return <div>Loading...</div>

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setGeneralError('')

    const payload = {
      title,
      priority,
      ...(isEdit && { status }),
      property_id: propertyId ? Number(propertyId) : undefined,
      service_provider_id: serviceProviderId ? Number(serviceProviderId) : undefined,
      description: description || undefined,
      scheduled_date: scheduledDate || undefined,
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(payload)
      } else {
        await createMutation.mutateAsync(payload)
      }
      navigate('/maintenance-tasks')
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
      <h2>{isEdit ? 'Edit Maintenance Task' : 'Create Maintenance Task'}</h2>

      {generalError && <div style={alertStyle}>{generalError}</div>}

      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label htmlFor="title" style={labelStyle}>Title *</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} maxLength={200} required />
          {errors.title && <p style={errorStyle}>{errors.title[0]}</p>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="priority" style={labelStyle}>Priority *</label>
          <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as MTPriority)} style={inputStyle}>
            {MT_PRIORITIES.map((p) => (
              <option key={p} value={p}>{MT_PRIORITY_LABELS[p]}</option>
            ))}
          </select>
          {errors.priority && <p style={errorStyle}>{errors.priority[0]}</p>}
        </div>

        {isEdit && (
          <div style={fieldStyle}>
            <label htmlFor="status" style={labelStyle}>Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value as MTStatus)} style={inputStyle}>
              {MT_STATUSES.map((s) => (
                <option key={s} value={s}>{MT_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        )}

        <div style={fieldStyle}>
          <label htmlFor="property_id" style={labelStyle}>Property</label>
          <select id="property_id" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} style={inputStyle}>
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
          <label htmlFor="scheduled_date" style={labelStyle}>Scheduled Date</label>
          <input id="scheduled_date" type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} style={inputStyle} />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="description" style={labelStyle}>Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, minHeight: '80px' }} />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" disabled={isPending} style={submitBtnStyle}>{isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}</button>
          <button type="button" onClick={() => navigate('/maintenance-tasks')} style={cancelBtnStyle}>Cancel</button>
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
