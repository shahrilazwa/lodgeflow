import { useParams } from 'react-router-dom'
import { ButtonLink, ContentCard, PageHeader, PageLayout, StatusBadge } from '@/components/ui/Page'
import FacilityAmenityList from '@/features/facilities/FacilityAmenityList'
import { useProperty } from './api'

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: property, isLoading, error } = useProperty(Number(id))

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader title="Property" description="Loading property details..." backTo="/properties" backLabel="Back to Properties" />
        <ContentCard>Loading property...</ContentCard>
      </PageLayout>
    )
  }

  if (error || !property) {
    return (
      <PageLayout>
        <PageHeader title="Property unavailable" backTo="/properties" backLabel="Back to Properties" />
        <ContentCard>
          <p style={{ margin: 0, color: '#dc2626' }}>Unable to load this property record.</p>
        </ContentCard>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Property"
        title={property.name}
        description="Review property information, facilities and related units."
        backTo="/properties"
        backLabel="Back to Properties"
        meta={<StatusBadge tone={property.is_active ? 'success' : 'danger'}>{property.is_active ? 'Active' : 'Inactive'}</StatusBadge>}
        action={<ButtonLink to={`/properties/${property.id}/edit`} variant="primary">Edit Property</ButtonLink>}
      />

      <ContentCard>
        <div style={{ display: 'grid', gap: '22px' }}>
          <DetailItem label="Address" value={property.address} />
          {property.description && <DetailItem label="Description" value={property.description} />}
          <div>
            <p style={labelStyle}>Facilities</p>
            <FacilityAmenityList facilities={property.facilities} />
          </div>
          <DetailItem label="Created" value={new Date(property.created_at).toLocaleDateString()} />
        </div>
      </ContentCard>

      <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <ButtonLink to={`/properties/${property.id}/units`}>Manage Units</ButtonLink>
        <ButtonLink to="/properties" variant="ghost">Back</ButtonLink>
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
