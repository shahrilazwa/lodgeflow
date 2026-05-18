import { useParams } from 'react-router-dom'
import { ButtonLink, ContentCard, PageHeader, PageLayout, StatusBadge } from '@/components/ui/Page'
import { useUnit } from './api'
import { UNIT_TYPE_LABELS } from './types'

export default function UnitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: unit, isLoading, error } = useUnit(Number(id))

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader title="Unit" description="Loading unit details..." />
        <ContentCard>Loading unit...</ContentCard>
      </PageLayout>
    )
  }

  if (error || !unit) {
    return (
      <PageLayout>
        <PageHeader title="Unit unavailable" />
        <ContentCard>
          <p style={{ margin: 0, color: '#dc2626' }}>Unable to load this unit record.</p>
        </ContentCard>
      </PageLayout>
    )
  }

  const backPath = `/properties/${unit.property_id}/units`

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Unit"
        title={unit.name}
        description="Review unit information used for booking and operations."
        backTo={backPath}
        backLabel="Back to Units"
        meta={<StatusBadge tone={unit.is_active ? 'success' : 'danger'}>{unit.is_active ? 'Active' : 'Inactive'}</StatusBadge>}
        action={<ButtonLink to={`/units/${unit.id}/edit`} variant="primary">Edit Unit</ButtonLink>}
      />

      <ContentCard>
        <div style={{ display: 'grid', gap: '16px' }}>
          <DetailItem label="Type" value={UNIT_TYPE_LABELS[unit.type]} />
          <DetailItem label="Price Per Night" value={unit.price_per_night ? `RM ${Number(unit.price_per_night).toFixed(2)}` : 'Not set'} />
          {unit.description && <DetailItem label="Description" value={unit.description} />}
          <DetailItem label="Created" value={new Date(unit.created_at).toLocaleDateString()} />
        </div>
      </ContentCard>

      <div style={{ marginTop: '14px' }}>
        <ButtonLink to={backPath} variant="ghost">Back</ButtonLink>
      </div>
    </PageLayout>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ margin: '0 0 4px', color: '#71717a', fontSize: '0.78rem', fontWeight: 700 }}>{label}</p>
      <p style={{ margin: 0, color: '#18181b', fontSize: '0.9rem', lineHeight: 1.6 }}>{value}</p>
    </div>
  )
}
