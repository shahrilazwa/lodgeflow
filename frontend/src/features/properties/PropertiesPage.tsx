import { Link } from 'react-router-dom'
import {
  Button,
  ButtonLink,
  ContentCard,
  EmptyState,
  PageHeader,
  PageLayout,
  StatusBadge,
} from '@/components/ui/Page'
import { useProperties, useDeactivateProperty, useActivateProperty } from './api'
import type { Property } from './types'

export default function PropertiesPage() {
  const { data: properties, isLoading, error } = useProperties()
  const deactivate = useDeactivateProperty()
  const activate = useActivateProperty()

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader title="Properties" description="Loading property records..." />
        <ContentCard>Loading properties...</ContentCard>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout>
        <PageHeader title="Properties" description="Manage your accommodation locations." />
        <ContentCard>
          <p style={{ margin: 0, color: '#dc2626' }}>Error loading properties.</p>
        </ContentCard>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Workspace"
        title="Properties"
        description="Manage your accommodation locations before setting up units, bookings and operations."
        action={<ButtonLink to="/properties/create" variant="primary">+ New Property</ButtonLink>}
      />

      {properties && properties.length === 0 && (
        <EmptyState
          title="No properties yet"
          description="Create your first property to start setting up rooms, guests, bookings and daily operations."
          action={<ButtonLink to="/properties/create" variant="primary">+ New Property</ButtonLink>}
        />
      )}

      <div style={{ display: 'grid', gap: '14px' }}>
        {properties?.map((property: Property) => (
          <ContentCard key={property.id}>
            <div style={{ display: 'grid', gridTemplateColumns: property.cover_photo ? '150px 1fr' : '1fr', gap: '16px', alignItems: 'start' }}>
              {property.cover_photo && (
                <Link to={`/properties/${property.id}`} style={coverLinkStyle}>
                  <img src={property.cover_photo.url} alt={`${property.name} cover`} style={coverImageStyle} />
                </Link>
              )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div>
                    <Link to={`/properties/${property.id}`} style={{ textDecoration: 'none', color: '#18181b' }}>
                      <h2 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 800 }}>{property.name}</h2>
                    </Link>
                    <p style={{ margin: '0 0 4px', color: '#52525b', fontSize: '0.86rem' }}>{property.address}</p>
                    {property.description && (
                      <p style={{ margin: 0, color: '#71717a', fontSize: '0.8rem' }}>{property.description}</p>
                    )}
                  </div>
                  <StatusBadge tone={property.is_active ? 'success' : 'danger'}>
                    {property.is_active ? 'Active' : 'Inactive'}
                  </StatusBadge>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <ButtonLink to={`/properties/${property.id}`} size="sm">View</ButtonLink>
                  <ButtonLink to={`/properties/${property.id}/edit`} size="sm">Edit</ButtonLink>
                  <ButtonLink to={`/properties/${property.id}/units`} size="sm">Units</ButtonLink>
                  {property.is_active ? (
                    <Button size="sm" variant="danger" onClick={() => deactivate.mutate(property.id)}>Deactivate</Button>
                  ) : (
                    <Button size="sm" onClick={() => activate.mutate(property.id)}>Activate</Button>
                  )}
                </div>
              </div>
            </div>
          </ContentCard>
        ))}
      </div>
    </PageLayout>
  )
}

const coverLinkStyle: React.CSSProperties = {
  display: 'block',
  width: '150px',
  height: '110px',
  borderRadius: '14px',
  overflow: 'hidden',
  background: '#f4f4f5',
}

const coverImageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
}
