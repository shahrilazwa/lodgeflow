import { useParams } from 'react-router-dom'
import { ButtonLink, ContentCard, PageHeader, PageLayout, StatusBadge } from '@/components/ui/Page'
import FacilityAmenityList from '@/features/facilities/FacilityAmenityList'
import { useUnit } from './api'
import { BED_TYPE_LABELS, UNIT_TYPE_LABELS } from './types'
import UnitPhotoGallery from './UnitPhotoGallery'

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
  const calculatedOccupancy = unit.beds?.reduce((total, bed) => total + bed.quantity * bed.capacity_per_bed, 0) ?? 0

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Unit"
        title={unit.name}
        description="Review unit information, photos, bed setup, facilities and pricing used for booking and operations."
        backTo={backPath}
        backLabel="Back to Units"
        meta={<StatusBadge tone={unit.is_active ? 'success' : 'danger'}>{unit.is_active ? 'Active' : 'Inactive'}</StatusBadge>}
        action={<ButtonLink to={`/units/${unit.id}/edit`} variant="primary">Edit Unit</ButtonLink>}
      />

      <UnitPhotoGallery unitId={unit.id} photos={unit.photos} />

      <div style={{ marginTop: '14px' }}>
        <ContentCard>
          <div style={{ display: 'grid', gap: '22px' }}>
            <DetailItem label="Type" value={UNIT_TYPE_LABELS[unit.type]} />
            <DetailItem label="Price Per Night" value={unit.price_per_night ? `RM ${Number(unit.price_per_night).toFixed(2)}` : 'Not set'} />
            <DetailItem label="Max Occupancy" value={unit.max_occupancy ? `${unit.max_occupancy} guest${unit.max_occupancy === 1 ? '' : 's'} (${unit.occupancy_source})` : 'Not set'} />
            {unit.description && <DetailItem label="Description" value={unit.description} />}
            <div>
              <p style={labelStyle}>Bed Setup</p>
              {unit.beds && unit.beds.length > 0 ? (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {unit.beds.map((bed, index) => (
                    <div key={`${bed.bed_type}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 12px', borderRadius: '10px', background: '#f8fafc' }}>
                      <span style={{ color: '#18181b', fontSize: '0.86rem', fontWeight: 700 }}>{bed.quantity} × {BED_TYPE_LABELS[bed.bed_type]}</span>
                      <span style={{ color: '#71717a', fontSize: '0.82rem' }}>{bed.capacity_per_bed} guest{bed.capacity_per_bed === 1 ? '' : 's'} each</span>
                    </div>
                  ))}
                  <p style={{ margin: 0, color: '#71717a', fontSize: '0.82rem' }}>Calculated occupancy from beds: <strong>{calculatedOccupancy}</strong></p>
                </div>
              ) : (
                <p style={{ margin: 0, color: '#71717a', fontSize: '0.86rem' }}>No bed setup recorded.</p>
              )}
            </div>
            <div>
              <p style={labelStyle}>Facilities</p>
              <FacilityAmenityList facilities={unit.facilities} />
            </div>
            <DetailItem label="Created" value={new Date(unit.created_at).toLocaleDateString()} />
          </div>
        </ContentCard>
      </div>

      <div style={{ marginTop: '14px' }}>
        <ButtonLink to={backPath} variant="ghost">Back</ButtonLink>
      </div>
    </PageLayout>
  )
}

const labelStyle: React.CSSProperties = { margin: '0 0 10px', color: '#71717a', fontSize: '0.78rem', fontWeight: 700 }

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={labelStyle}>{label}</p>
      <p style={{ margin: 0, color: '#18181b', fontSize: '0.9rem', lineHeight: 1.6 }}>{value}</p>
    </div>
  )
}
