import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGuests } from './api'
import type { Guest } from './types'

export default function GuestsPage() {
  const [search, setSearch] = useState('')
  const { data: guests, isLoading, error } = useGuests(search || undefined)

  if (error) return <div style={{ color: 'red' }}>Error loading guests.</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Guests</h2>
        <Link to="/guests/create" style={linkButtonStyle}>+ New Guest</Link>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      {isLoading && <div>Loading guests...</div>}

      {guests && guests.length === 0 && (
        <p style={{ color: '#666' }}>
          {search ? 'No guests found matching your search.' : 'No guests yet. Create your first guest record.'}
        </p>
      )}

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {guests?.map((guest: Guest) => (
          <div key={guest.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Link to={`/guests/${guest.id}`} style={{ textDecoration: 'none', color: '#1a1a2e' }}>
                  <h4 style={{ margin: '0 0 0.25rem' }}>{guest.full_name}</h4>
                </Link>
                <p style={{ margin: 0, color: '#555', fontSize: '0.875rem' }}>📞 {guest.phone}</p>
                {guest.email && <p style={{ margin: '0.15rem 0 0', color: '#777', fontSize: '0.8rem' }}>✉️ {guest.email}</p>}
              </div>
            </div>
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
              <Link to={`/guests/${guest.id}`} style={smallBtnStyle}>View</Link>
              <Link to={`/guests/${guest.id}/edit`} style={smallBtnStyle}>Edit</Link>
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
const searchInputStyle: React.CSSProperties = { width: '100%', maxWidth: '400px', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.375rem', fontSize: '0.875rem', boxSizing: 'border-box' }
