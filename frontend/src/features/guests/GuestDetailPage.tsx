import { useParams, Link } from 'react-router-dom'
import { useGuest } from './api'

export default function GuestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: guest, isLoading, error } = useGuest(Number(id))

  if (isLoading) return <div>Loading guest...</div>
  if (error) return <div style={{ color: 'red' }}>Guest not found.</div>
  if (!guest) return <div>Guest not found.</div>

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/guests" style={{ color: '#555', fontSize: '0.875rem' }}>← Back to Guests</Link>
      </div>

      <h2 style={{ marginBottom: '1rem' }}>{guest.full_name}</h2>

      <div style={cardStyle}>
        <p><strong>Phone:</strong> {guest.phone}</p>
        {guest.email && <p><strong>Email:</strong> {guest.email}</p>}
        {guest.identification_number && <p><strong>ID Number:</strong> {guest.identification_number}</p>}
        <p style={{ color: '#888', fontSize: '0.8rem' }}>Created: {new Date(guest.created_at).toLocaleDateString()}</p>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <Link to={`/guests/${guest.id}/edit`} style={btnStyle}>Edit</Link>
      </div>

      {/* Booking history will be added when Booking frontend is implemented */}
    </div>
  )
}

const cardStyle: React.CSSProperties = { border: '1px solid #e0e0e0', borderRadius: '0.5rem', padding: '1rem', backgroundColor: '#fff' }
const btnStyle: React.CSSProperties = { padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '0.375rem', textDecoration: 'none', color: '#333', fontSize: '0.875rem' }
