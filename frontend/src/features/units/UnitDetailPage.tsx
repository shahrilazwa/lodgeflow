import { useParams, Link } from 'react-router-dom'
import { useUnit } from './api'
import { UNIT_TYPE_LABELS } from './types'

export default function UnitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: unit, isLoading, error } = useUnit(Number(id))

  if (isLoading) return <div>Loading unit...</div>
  if (error) return <div style={{ color: 'red' }}>Unit not found.</div>
  if (!unit) return <div>Unit not found.</div>

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to={`/properties/${unit.property_id}/units`} style={{ color: '#555', fontSize: '0.875rem' }}>← Back to Units</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>{unit.name}</h2>
        <span style={unit.is_active ? badgeActive : badgeInactive}>
          {unit.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div style={cardStyle}>
        <p><strong>Type:</strong> {UNIT_TYPE_LABELS[unit.type]}</p>
        {unit.description && <p><strong>Description:</strong> {unit.description}</p>}
        <p style={{ color: '#888', fontSize: '0.8rem' }}>Created: {new Date(unit.created_at).toLocaleDateString()}</p>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <Link to={`/units/${unit.id}/edit`} style={btnStyle}>Edit</Link>
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = { border: '1px solid #e0e0e0', borderRadius: '0.5rem', padding: '1rem', backgroundColor: '#fff' }
const badgeActive: React.CSSProperties = { backgroundColor: '#d4edda', color: '#155724', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }
const badgeInactive: React.CSSProperties = { backgroundColor: '#f8d7da', color: '#721c24', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }
const btnStyle: React.CSSProperties = { padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '0.375rem', textDecoration: 'none', color: '#333', fontSize: '0.875rem' }
