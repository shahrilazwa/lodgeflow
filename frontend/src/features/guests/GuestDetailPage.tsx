import { useParams } from 'react-router-dom'
import { ButtonLink, ContentCard, PageHeader, PageLayout } from '@/components/ui/Page'
import { useGuest } from './api'

export default function GuestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: guest, isLoading, error } = useGuest(Number(id))

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader title="Guest" description="Loading guest details..." backTo="/guests" backLabel="Back to Guests" />
        <ContentCard>Loading guest...</ContentCard>
      </PageLayout>
    )
  }

  if (error || !guest) {
    return (
      <PageLayout>
        <PageHeader title="Guest unavailable" backTo="/guests" backLabel="Back to Guests" />
        <ContentCard>
          <p style={{ margin: 0, color: '#dc2626' }}>Unable to load this guest record.</p>
        </ContentCard>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Guest"
        title={guest.full_name}
        description="Review guest contact and identification details used for bookings."
        backTo="/guests"
        backLabel="Back to Guests"
        action={<ButtonLink to={`/guests/${guest.id}/edit`} variant="primary">Edit Guest</ButtonLink>}
      />

      <ContentCard>
        <div style={{ display: 'grid', gap: '16px' }}>
          <DetailItem label="Phone" value={guest.phone} />
          {guest.email && <DetailItem label="Email" value={guest.email} />}
          {guest.identification_number && <DetailItem label="Identification Number" value={guest.identification_number} />}
          <DetailItem label="Created" value={new Date(guest.created_at).toLocaleDateString()} />
        </div>
      </ContentCard>

      <div style={{ marginTop: '14px' }}>
        <ButtonLink to="/guests" variant="ghost">Back</ButtonLink>
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
