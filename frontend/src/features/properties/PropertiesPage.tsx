import { Link } from 'react-router-dom'
import { useProperties, useDeactivateProperty, useActivateProperty, useDeleteProperty } from './api'
import type { Property } from './types'

export default function PropertiesPage() {
  const { data: properties, isLoading, error } = useProperties()
  const deactivate = useDeactivateProperty()
  const activate = useActivateProperty()
  const deleteProp = useDeleteProperty()

  if (isLoading) return <div>Loading properties...</div>
  if (error) return <div style={{ color: 'red' }}>Error loading properties.</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Properties</h2>
        <Link to="/properties/create" style={linkButtonStyle}>+ New Property</Link>
      </div>

      {properties && properties.length === 0 && (
        <p style={{ color: '#666' }}>No properties yet. Create your first property to get started.</p>
      )}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {properties?.map((property: Property) => (
          <div key={property.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Link to={`/properties/${property.id}`} style={{ textDecoration: 'none', color: '#1a1a2e' }}>
                  <h3 style={{ margin: '0 0 0.25rem' }}>{property.name}</h3>
                </Link>
                <p style={{ margin: '0 0 0.25rem', color: '#555', fontSize: '0.875rem' }}>{property.address}</p>
                {property.description && (
                  <p style={{ margin: 0, color: '#777', fontSize: '0.8rem' }}>{property.description}</p>
                )}
              </div>
              <span style={property.is_active ? badgeActive : badgeInactive}>
                {property.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Link to={`/properties/${property.id}`} style={smallBtnStyle}>View</Link>
              <Link to={`/properties/${property.id}/edit`} style={smallBtnStyle}>Edit</Link>
              <Link to={`/properties/${property.id}/units`} style={smallBtnStyle}>Units</Link>
              {property.is_active ? (
                <button type="button" style={smallBtnDanger} onClick={() => deactivate.mutate(property.id)}>Deactivate</button>
              ) : (
                <button type="button" style={smallBtnStyle} onClick={() => activate.mutate(property.id)}>Activate</button>
              )}
              <button type="button" style={smallBtnDanger} onClick={() => { if (confirm('Delete this property?')) deleteProp.mutate(property.id) }}>Delete</button>
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
const linkButtonStyle: React.CSSProperties = { padding: '0.5rem 1rem', backgroundColor: '#1a1a2e', color: '#fff', borderRadius: '0.375rem', textDecoration: 'none', fontSize: '0.875rem' }
const smallBtnStyle: React.CSSProperties = { padding: '0.25rem 0.5rem', border: '1px solid #ccc', borderRadius: '0.25rem', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'none', color: '#333', backgroundColor: '#fff' }
const smallBtnDanger: React.CSSProperties = { ...smallBtnStyle, color: '#dc3545', borderColor: '#dc3545' }
