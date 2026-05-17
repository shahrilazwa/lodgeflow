import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMaintenanceTasks } from './api'
import { MT_STATUSES, MT_STATUS_LABELS, MT_PRIORITIES, MT_PRIORITY_LABELS } from './types'
import type { MaintenanceTask } from './types'

export default function MaintenanceTasksPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const { data: tasks, isLoading, error } = useMaintenanceTasks({
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
  })

  if (error) return <div style={{ color: 'red' }}>Error loading maintenance tasks.</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Maintenance Tasks</h2>
        <Link to="/maintenance-tasks/create" style={linkButtonStyle}>+ New Task</Link>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="">All Statuses</option>
          {MT_STATUSES.map((s) => (
            <option key={s} value={s}>{MT_STATUS_LABELS[s]}</option>
          ))}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={selectStyle}>
          <option value="">All Priorities</option>
          {MT_PRIORITIES.map((p) => (
            <option key={p} value={p}>{MT_PRIORITY_LABELS[p]}</option>
          ))}
        </select>
      </div>

      {isLoading && <div>Loading...</div>}

      {tasks && tasks.length === 0 && <p style={{ color: '#666' }}>No maintenance tasks found.</p>}

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {tasks?.map((task: MaintenanceTask) => (
          <div key={task.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ margin: '0 0 0.25rem' }}>{task.title}</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {task.property && <span style={{ color: '#555', fontSize: '0.8rem' }}>📍 {task.property.name}</span>}
                  {task.unit && <span style={{ color: '#555', fontSize: '0.8rem' }}>🏠 {task.unit.name}</span>}
                  {task.service_provider && <span style={{ color: '#555', fontSize: '0.8rem' }}>🔧 {task.service_provider.name}</span>}
                </div>
                {task.scheduled_date && <p style={{ margin: '0.25rem 0 0', color: '#777', fontSize: '0.8rem' }}>Scheduled: {task.scheduled_date}</p>}
                {task.description && <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.8rem' }}>{task.description}</p>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
                <span style={statusBadge(task.status)}>{MT_STATUS_LABELS[task.status]}</span>
                <span style={priorityBadge(task.priority)}>{MT_PRIORITY_LABELS[task.priority]}</span>
              </div>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <Link to={`/maintenance-tasks/${task.id}/edit`} style={smallBtnStyle}>Edit</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function statusBadge(status: string): React.CSSProperties {
  const colors: Record<string, { bg: string; fg: string }> = {
    open: { bg: '#cce5ff', fg: '#004085' },
    in_progress: { bg: '#fff3cd', fg: '#856404' },
    completed: { bg: '#d4edda', fg: '#155724' },
    cancelled: { bg: '#e2e3e5', fg: '#383d41' },
  }
  const c = colors[status] || { bg: '#e2e3e5', fg: '#383d41' }
  return { backgroundColor: c.bg, color: c.fg, padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: 600 }
}

function priorityBadge(priority: string): React.CSSProperties {
  const colors: Record<string, { bg: string; fg: string }> = {
    low: { bg: '#d4edda', fg: '#155724' },
    medium: { bg: '#fff3cd', fg: '#856404' },
    high: { bg: '#f8d7da', fg: '#721c24' },
  }
  const c = colors[priority] || { bg: '#e2e3e5', fg: '#383d41' }
  return { backgroundColor: c.bg, color: c.fg, padding: '0.15rem 0.4rem', borderRadius: '0.2rem', fontSize: '0.65rem', fontWeight: 500 }
}

const cardStyle: React.CSSProperties = { border: '1px solid #e0e0e0', borderRadius: '0.5rem', padding: '1rem', backgroundColor: '#fff' }
const linkButtonStyle: React.CSSProperties = { padding: '0.5rem 1rem', backgroundColor: '#1a1a2e', color: '#fff', borderRadius: '0.375rem', textDecoration: 'none', fontSize: '0.875rem' }
const selectStyle: React.CSSProperties = { padding: '0.4rem', border: '1px solid #ccc', borderRadius: '0.375rem', fontSize: '0.875rem' }
const smallBtnStyle: React.CSSProperties = { padding: '0.25rem 0.5rem', border: '1px solid #ccc', borderRadius: '0.25rem', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'none', color: '#333', backgroundColor: '#fff' }
