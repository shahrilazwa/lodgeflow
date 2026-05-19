import { Link, useParams } from 'react-router-dom'
import { Button, ButtonLink, ContentCard, EmptyState, PageHeader, PageLayout, StatusBadge } from '@/components/ui/Page'
import { useUnitsForProperty, useDeactivateUnit, useActivateUnit } from './api'
import { useProperties, useProperty } from '@/features/properties/api'
import { UNIT_TYPE_LABELS } from './types'
import type { Unit } from './types'

export default function UnitsPage() {
  const { propertyId } = useParams<{ propertyId?: string }>()
  const pid = propertyId ? Number(propertyId) : undefined
  const hasPropertyContext = Number.isFinite(pid)

  if (!hasPropertyContext) {
    return <StandaloneUnitsPage />
  }

  return <PropertyUnitsPage propertyId={pid as number} />
}

function StandaloneUnitsPage() {
  const { data: properties, isLoading, error } = useProperties()

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader title="Units" description="Loading properties..." />
        <ContentCard>Loading properties...</ContentCard>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout>
        <PageHeader title="Units" description="Choose a property before managing units." />
        <ContentCard><p style={{ margin: 0, color: '#dc2626' }}>Error loading properties.</p></ContentCard>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Units"
        title="Units"
        description="Units are managed under each property. Choose a property to view or create units."
        action={<ButtonLink to="/properties" variant="primary">Go to Properties</ButtonLink>}
      />

      {properties && properties.length === 0 && (
        <EmptyState
          title="No properties yet"
          description="Create a property first, then add bookable spaces under it."
          action={<ButtonLink to="/properties/create" variant="primary">+ New Property</ButtonLink>}
        />
      )}

      <div style={{ display: 'grid', gap: '14px' }}>
        {properties?.map((property) => (
          <ContentCard key={property.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', color: '#18181b', fontSize: '1rem', fontWeight: 800 }}>{property.name}</h2>
                <p style={{ margin: 0, color: '#52525b', fontSize: '0.86rem' }}>{property.address}</p>
              </div>
              <StatusBadge tone={property.is_active ? 'success' : 'danger'}>{property.is_active ? 'Active' : 'Inactive'}</StatusBadge>
            </div>
            <div style={{ marginTop: '16px' }}>
              <ButtonLink to={`/properties/${property.id}/units`} size="sm">Manage Units</ButtonLink>
            </div>
          </ContentCard>
        ))}
      </div>
    </PageLayout>
  )
}

function PropertyUnitsPage({ propertyId }: { propertyId: number }) {
  const { data: property } = useProperty(propertyId)
  const { data: units, isLoading, error } = useUnitsForProperty(propertyId)
  const deactivate = useDeactivateUnit()
  const activate = useActivateUnit()

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader title="Units" description="Loading unit records..." backTo="/properties" backLabel="Back to Properties" />
        <ContentCard>Loading units...</ContentCard>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout>
        <PageHeader title="Units" description="Manage bookable spaces." backTo="/properties" backLabel="Back to Properties" />
        <ContentCard><p style={{ margin: 0, color: '#dc2626' }}>Error loading units.</p></ContentCard>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Units"
        title={property?.name ? `Units — ${property.name}` : 'Units'}
        description="Manage rooms, beds and whole-property units under this property."
        backTo="/properties"
        backLabel="Back to Properties"
        action={<ButtonLink to={`/properties/${propertyId}/units/create`} variant="primary">+ New Unit</ButtonLink>}
      />

      {units && units.length === 0 && (
        <EmptyState
          title="No units yet"
          description="Create your first unit for this property so it can be used in bookings and operations."
          action={<ButtonLink to={`/properties/${propertyId}/units/create`} variant="primary">+ New Unit</ButtonLink>}
        />
      )}

      <div style={{ display: 'grid', gap: '14px' }}>
        {units?.map((unit: Unit) => (
          <ContentCard key={unit.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
              <div>
                <Link to={`/units/${unit.id}`} style={{ textDecoration: 'none', color: '#18181b' }}>
                  <h2 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 800 }}>{unit.name}</h2>
                </Link>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <StatusBadge tone="info">{UNIT_TYPE_LABELS[unit.type]}</StatusBadge>
                  {unit.price_per_night && <StatusBadge tone="neutral">RM {Number(unit.price_per_night).toFixed(2)} / night</StatusBadge>}
                  {unit.max_occupancy && <StatusBadge tone="neutral">Up to {unit.max_occupancy} guest{unit.max_occupancy === 1 ? '' : 's'}</StatusBadge>}
                </div>
                {unit.description && <p style={{ margin: '8px 0 0', color: '#71717a', fontSize: '0.8rem' }}>{unit.description}</p>}
              </div>
              <StatusBadge tone={unit.is_active ? 'success' : 'danger'}>{unit.is_active ? 'Active' : 'Inactive'}</StatusBadge>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <ButtonLink to={`/units/${unit.id}`} size="sm">View</ButtonLink>
              <ButtonLink to={`/units/${unit.id}/edit`} size="sm">Edit</ButtonLink>
              {unit.is_active ? (
                <Button size="sm" variant="danger" onClick={() => deactivate.mutate(unit.id)}>Deactivate</Button>
              ) : (
                <Button size="sm" onClick={() => activate.mutate(unit.id)}>Activate</Button>
              )}
            </div>
          </ContentCard>
        ))}
      </div>
    </PageLayout>
  )
}
