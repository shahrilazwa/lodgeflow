import { useParams, Link } from 'react-router-dom'
import { useProperty } from './api'

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: property, isLoading, error } = useProperty(Number(id))

  if (isLoading) return <div>Loading property...</div>
  if (error) return <div style={{ color: 'red' }}>Property not found.</div>
  if (!property) return <div>Property not found.</div>

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/properties" style={{ color: '#555', fontSize: '0.875rem' }}>← Back to Properties</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>{property.name}</h2>
        <span style={property.is_active ? badgeActive : badgeInactive}>
          {property.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div style={cardStyle}>
        <p><strong>Address:</strong> {property.address}</p>
        {property.description && <p><strong>Description:</strong> {property.description}</p>}
        <p style={{ color: '#888', fontSize: '0.8rem' }}>Created: {new Date(property.created_at).toLocaleDateString()}</p>
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <Link to={`/properties/${property.id}/edit`} style={btnStyle}>Edit</Link>
        <Link to={`/properties/${property.id}/units`} style={btnStyle}>Manage Units</Link>
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = { border: '1px solid #e0e0e0', borderRadius: '0.5rem', padding: '1rem', backgroundColor: '#fff' }
const badgeActive: React.CSSProperties = { backgroundColor: '#d4edda', color: '#155724', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }
const badgeInactive: React.CSSProperties = { backgroundColor: '#f8d7da', color: '#721c24', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }
const btnStyle: React.CSSProperties = { padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '0.375rem', textDecoration: 'none', color: '#333', fontSize: '0.875rem' }
