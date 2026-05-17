import { useParams, Link } from 'react-router-dom'
import { useUnitsForProperty, useDeactivateUnit, useActivateUnit } from './api'
import { useProperty } from '@/features/properties/api'
import { UNIT_TYPE_LABELS } from './types'
import type { Unit } from './types'

export default function UnitsPage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const pid = Number(propertyId)
  const { data: property } = useProperty(pid)
  const { data: units, isLoading, error } = useUnitsForProperty(pid)
  const deactivate = useDeactivateUnit()
  const activate = useActivateUnit()

  if (isLoading) return <div>Loading units...</div>
  if (error) return <div style={{ color: 'red' }}>Error loading units.</div>

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/properties" style={{ color: '#555', fontSize: '0.875rem' }}>← Back to Properties</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Units — {property?.name || `Property #${pid}`}</h2>
        <Link to={`/properties/${pid}/units/create`} style={linkButtonStyle}>+ New Unit</Link>
      </div>

      {units && units.length === 0 && (
        <p style={{ color: '#666' }}>No units yet. Create your first unit for this property.</p>
      )}

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {units?.map((unit: Unit) => (
          <div key={unit.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 0.25rem' }}>{unit.name}</h4>
                <span style={typeBadge}>{UNIT_TYPE_LABELS[unit.type]}</span>
                {unit.description && <p style={{ margin: '0.25rem 0 0', color: '#777', fontSize: '0.8rem' }}>{unit.description}</p>}
              </div>
              <span style={unit.is_active ? badgeActive : badgeInactive}>
                {unit.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
              <Link to={`/units/${unit.id}`} style={smallBtnStyle}>View</Link>
              <Link to={`/units/${unit.id}/edit`} style={smallBtnStyle}>Edit</Link>
              {unit.is_active ? (
                <button type="button" style={smallBtnDanger} onClick={() => deactivate.mutate(unit.id)}>Deactivate</button>
              ) : (
                <button type="button" style={smallBtnStyle} onClick={() => activate.mutate(unit.id)}>Activate</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = { border: '1px solid #e0e0e0', borderRadius: '0.5rem', padding: '1rem', backgroundColor: '#fff' }
const badgeActive: React.CSSProperties = { backgroundColor: '#d4edda', color: '#155724', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }
const badgeInactive: React.CSSProperties = { backgroundColor: '#f8d7da', color: '#721c24', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }
const typeBadge: React.CSSProperties = { backgroundColor: '#e8f4fd', color: '#0c5460', padding: '0.15rem 0.4rem', borderRadius: '0.2rem', fontSize: '0.7rem', fontWeight: 500 }
const linkButtonStyle: React.CSSProperties = { padding: '0.5rem 1rem', backgroundColor: '#1a1a2e', color: '#fff', borderRadius: '0.375rem', textDecoration: 'none', fontSize: '0.875rem' }
const smallBtnStyle: React.CSSProperties = { padding: '0.25rem 0.5rem', border: '1px solid #ccc', borderRadius: '0.25rem', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'none', color: '#333', backgroundColor: '#fff' }
const smallBtnDanger: React.CSSProperties = { ...smallBtnStyle, color: '#dc3545', borderColor: '#dc3545' }
