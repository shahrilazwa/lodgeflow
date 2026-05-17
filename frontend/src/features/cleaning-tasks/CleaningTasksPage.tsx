import { useState } from 'react'
import { useCleaningTasks, useCreateCleaningTask, useUpdateCleaningTaskStatus, useUpdateCleaningTaskNotes } from './api'
import { CLEANING_TASK_STATUSES, CLEANING_STATUS_LABELS } from './types'
import type { CleaningTask } from './types'

export default function CleaningTasksPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const { data: tasks, isLoading, error } = useCleaningTasks({ status: statusFilter || undefined })
  const updateStatus = useUpdateCleaningTaskStatus()
  const updateNotes = useUpdateCleaningTaskNotes()
  const createTask = useCreateCleaningTask()

  const [showCreate, setShowCreate] = useState(false)
  const [newUnitId, setNewUnitId] = useState('')
  const [editingNotes, setEditingNotes] = useState<number | null>(null)
  const [notesValue, setNotesValue] = useState('')

  if (error) return <div style={{ color: 'red' }}>Error loading cleaning tasks.</div>

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await createTask.mutateAsync({ unit_id: Number(newUnitId) })
    setShowCreate(false)
    setNewUnitId('')
  }

  function startEditNotes(task: CleaningTask) {
    setEditingNotes(task.id)
    setNotesValue(task.notes || '')
  }

  async function saveNotes(id: number) {
    await updateNotes.mutateAsync({ id, notes: notesValue || null })
    setEditingNotes(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Cleaning Tasks</h2>
        <button type="button" onClick={() => setShowCreate(!showCreate)} style={linkButtonStyle}>
          {showCreate ? 'Cancel' : '+ Manual Task'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} style={formStyle}>
          <label style={labelStyle}>Unit ID *</label>
          <input type="number" value={newUnitId} onChange={(e) => setNewUnitId(e.target.value)} style={inputStyle} required min={1} />
          <button type="submit" disabled={createTask.isPending} style={submitBtnStyle}>
            {createTask.isPending ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="">All Statuses</option>
          {CLEANING_TASK_STATUSES.map((s) => (
            <option key={s} value={s}>{CLEANING_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {isLoading && <div>Loading...</div>}

      {tasks && tasks.length === 0 && <p style={{ color: '#666' }}>No cleaning tasks found.</p>}

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {tasks?.map((task: CleaningTask) => (
          <div key={task.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ margin: '0 0 0.25rem' }}>{task.unit?.name || `Unit #${task.unit_id}`}</h4>
                {task.booking && (
                  <p style={{ margin: 0, color: '#777', fontSize: '0.8rem' }}>
                    Booking: {task.booking.check_in_date} → {task.booking.check_out_date}
                  </p>
                )}
              </div>
              <span style={statusBadge(task.status)}>{CLEANING_STATUS_LABELS[task.status]}</span>
            </div>

            {/* Notes */}
            {editingNotes === task.id ? (
              <div style={{ marginTop: '0.5rem' }}>
                <textarea value={notesValue} onChange={(e) => setNotesValue(e.target.value)} style={{ ...inputStyle, minHeight: '60px' }} maxLength={1000} />
                <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem' }}>
                  <button type="button" onClick={() => saveNotes(task.id)} style={smallBtnStyle}>Save</button>
                  <button type="button" onClick={() => setEditingNotes(null)} style={smallBtnStyle}>Cancel</button>
                </div>
              </div>
            ) : (
              task.notes && <p style={{ margin: '0.5rem 0 0', color: '#555', fontSize: '0.85rem' }}>{task.notes}</p>
            )}

            {/* Actions */}
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {task.status === 'pending' && (
                <button type="button" onClick={() => updateStatus.mutate({ id: task.id, status: 'in_progress' })} style={actionBtn}>
                  Mark In Progress
                </button>
              )}
              {task.status === 'in_progress' && (
                <button type="button" onClick={() => updateStatus.mutate({ id: task.id, status: 'completed' })} style={actionBtn}>
                  Mark Completed
                </button>
              )}
              {editingNotes !== task.id && (
                <button type="button" onClick={() => startEditNotes(task)} style={smallBtnStyle}>
                  {task.notes ? 'Edit Notes' : 'Add Notes'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function statusBadge(status: string): React.CSSProperties {
  const colors: Record<string, { bg: string; fg: string }> = {
    pending: { bg: '#fff3cd', fg: '#856404' },
    in_progress: { bg: '#cce5ff', fg: '#004085' },
    completed: { bg: '#d4edda', fg: '#155724' },
  }
  const c = colors[status] || { bg: '#e2e3e5', fg: '#383d41' }
  return { backgroundColor: c.bg, color: c.fg, padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: 600 }
}

const cardStyle: React.CSSProperties = { border: '1px solid #e0e0e0', borderRadius: '0.5rem', padding: '1rem', backgroundColor: '#fff' }
const linkButtonStyle: React.CSSProperties = { padding: '0.5rem 1rem', backgroundColor: '#1a1a2e', color: '#fff', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }
const formStyle: React.CSSProperties = { border: '1px solid #e0e0e0', borderRadius: '0.375rem', padding: '1rem', marginBottom: '1rem', backgroundColor: '#fafafa', display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }
const labelStyle: React.CSSProperties = { fontSize: '0.8rem', fontWeight: 500 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.4rem', border: '1px solid #ccc', borderRadius: '0.25rem', fontSize: '0.85rem', boxSizing: 'border-box' }
const submitBtnStyle: React.CSSProperties = { padding: '0.4rem 1rem', backgroundColor: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }
const selectStyle: React.CSSProperties = { padding: '0.4rem', border: '1px solid #ccc', borderRadius: '0.375rem', fontSize: '0.875rem' }
const actionBtn: React.CSSProperties = { padding: '0.3rem 0.75rem', backgroundColor: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem' }
const smallBtnStyle: React.CSSProperties = { padding: '0.25rem 0.5rem', border: '1px solid #ccc', borderRadius: '0.25rem', fontSize: '0.75rem', cursor: 'pointer', color: '#333', backgroundColor: '#fff' }
