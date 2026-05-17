import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ButtonLink,
  ContentCard,
  EmptyState,
  PageHeader,
  PageLayout,
  TextInput,
} from '@/components/ui/Page'
import { useGuests } from './api'
import type { Guest } from './types'

export default function GuestsPage() {
  const [search, setSearch] = useState('')
  const { data: guests, isLoading, error } = useGuests(search || undefined)

  if (error) {
    return (
      <PageLayout>
        <PageHeader title="Guests" description="Manage guest records and contact information." />
        <ContentCard>
          <p style={{ margin: 0, color: '#dc2626' }}>Error loading guests.</p>
        </ContentCard>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Guests"
        title="Guests"
        description="Manage guest profiles, contact details and identification references for bookings."
        action={<ButtonLink to="/guests/create" variant="primary">+ New Guest</ButtonLink>}
      />

      <ContentCard>
        <div style={{ maxWidth: '420px' }}>
          <TextInput
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </ContentCard>

      {isLoading && <ContentCard>Loading guests...</ContentCard>}

      {guests && guests.length === 0 && (
        <EmptyState
          title={search ? 'No guests found' : 'No guests yet'}
          description={search ? 'Try a different name or phone number.' : 'Create your first guest record to use in bookings.'}
          action={!search && <ButtonLink to="/guests/create" variant="primary">+ New Guest</ButtonLink>}
        />
      )}

      <div style={{ display: 'grid', gap: '14px', marginTop: '14px' }}>
        {guests?.map((guest: Guest) => (
          <ContentCard key={guest.id}>
            <div>
              <Link to={`/guests/${guest.id}`} style={{ textDecoration: 'none', color: '#18181b' }}>
                <h2 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 800 }}>{guest.full_name}</h2>
              </Link>
              <p style={{ margin: 0, color: '#52525b', fontSize: '0.86rem' }}>Phone: {guest.phone}</p>
              {guest.email && <p style={{ margin: '4px 0 0', color: '#71717a', fontSize: '0.8rem' }}>Email: {guest.email}</p>}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <ButtonLink to={`/guests/${guest.id}`} size="sm">View</ButtonLink>
              <ButtonLink to={`/guests/${guest.id}/edit`} size="sm">Edit</ButtonLink>
            </div>
          </ContentCard>
        ))}
      </div>
    </PageLayout>
  )
}
