import { Link, useParams } from 'react-router-dom'
import { Button, ButtonLink, ContentCard, EmptyState, PageHeader, PageLayout, StatusBadge } from '@/components/ui/Page'
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
        <PageHeader title="Units" description="Manage rooms and rentable spaces." backTo="/properties" backLabel="Back to Properties" />
        <ContentCard>
          <p style={{ margin: 0, color: '#dc2626' }}>Error loading units.</p>
        </ContentCard>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Units"
        title={property?.name ? `Units — ${property.name}` : `Units — Property #${pid}`}
        description="Manage rooms, beds, halls and other rentable spaces under this property."
        backTo="/properties"
        backLabel="Back to Properties"
        action={<ButtonLink to={`/properties/${pid}/units/create`} variant="primary">+ New Unit</ButtonLink>}
      />

      {units && units.length === 0 && (
        <EmptyState
          title="No units yet"
          description="Create your first unit for this property so it can be used in bookings and operations."
          action={<ButtonLink to={`/properties/${pid}/units/create`} variant="primary">+ New Unit</ButtonLink>}
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
                <StatusBadge tone="info">{UNIT_TYPE_LABELS[unit.type]}</StatusBadge>
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
