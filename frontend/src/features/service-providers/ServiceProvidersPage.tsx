import { Link } from 'react-router-dom'
import { useServiceProviders, useDeleteServiceProvider } from './api'
import type { ServiceProvider } from './types'

export default function ServiceProvidersPage() {
  const { data: providers, isLoading, error } = useServiceProviders()
  const deleteMutation = useDeleteServiceProvider()

  if (isLoading) return <div>Loading service providers...</div>
  if (error) return <div style={{ color: 'red' }}>Error loading service providers.</div>

  function handleDelete(id: number) {
    if (confirm('Delete this service provider?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Service Providers</h2>
        <Link to="/service-providers/create" style={linkButtonStyle}>+ New Provider</Link>
      </div>

      {deleteMutation.error && (
        <div style={alertStyle}>Cannot delete: this provider has linked expenses.</div>
      )}

      {providers && providers.length === 0 && (
        <p style={{ color: '#666' }}>No service providers yet.</p>
      )}

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {providers?.map((sp: ServiceProvider) => (
          <div key={sp.id} style={cardStyle}>
            <div>
              <h4 style={{ margin: '0 0 0.25rem' }}>{sp.name}</h4>
              <p style={{ margin: 0, color: '#555', fontSize: '0.875rem' }}>{sp.service_type}</p>
              {sp.phone && <p style={{ margin: '0.15rem 0 0', color: '#777', fontSize: '0.8rem' }}>📞 {sp.phone}</p>}
            </div>
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
              <Link to={`/service-providers/${sp.id}/edit`} style={smallBtnStyle}>Edit</Link>
              <button type="button" onClick={() => handleDelete(sp.id)} style={smallBtnDanger}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = { border: '1px solid #e0e0e0', borderRadius: '0.5rem', padding: '1rem', backgroundColor: '#fff' }
const linkButtonStyle: React.CSSProperties = { padding: '0.5rem 1rem', backgroundColor: '#1a1a2e', color: '#fff', borderRadius: '0.375rem', textDecoration: 'none', fontSize: '0.875rem' }
const smallBtnStyle: React.CSSProperties = { padding: '0.25rem 0.5rem', border: '1px solid #ccc', borderRadius: '0.25rem', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'none', color: '#333', backgroundColor: '#fff' }
const smallBtnDanger: React.CSSProperties = { ...smallBtnStyle, color: '#dc3545', borderColor: '#dc3545' }
const alertStyle: React.CSSProperties = { backgroundColor: '#f8d7da', color: '#721c24', padding: '0.5rem', borderRadius: '0.25rem', marginBottom: '1rem', fontSize: '0.85rem' }
