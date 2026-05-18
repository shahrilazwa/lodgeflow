import { ButtonLink, ContentCard, PageHeader, PageLayout } from '@/components/ui/Page'

export default function PaymentsPage() {
  return (
    <PageLayout>
      <PageHeader
        eyebrow="Payments"
        title="Payments"
        description="Payments and refunds are recorded from the related booking detail page."
      />

      <ContentCard>
        <div style={{ display: 'grid', gap: '10px' }}>
          <h2 style={{ margin: 0, color: '#18181b', fontSize: '1rem', fontWeight: 800 }}>Managed from bookings</h2>
          <p style={{ margin: 0, color: '#71717a', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Open a booking record to review payment status, record payments or add refunds.
          </p>
          <div style={{ marginTop: '8px' }}>
            <ButtonLink to="/bookings" variant="primary">Go to Bookings</ButtonLink>
          </div>
        </div>
      </ContentCard>
    </PageLayout>
  )
}
