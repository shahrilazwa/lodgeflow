import { useParams } from 'react-router-dom'
import { ContentCard, PageHeader, PageLayout } from '@/components/ui/Page'
import { useBooking } from './api'
import BookingFormContent from './BookingFormContent'

export default function BookingFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const { data: existing, isLoading, error } = useBooking(Number(id))

  if (isEdit && isLoading) {
    return (
      <PageLayout width="narrow">
        <PageHeader title="Booking" description="Loading booking form..." backTo="/bookings" backLabel="Back to Bookings" />
        <ContentCard>Loading...</ContentCard>
      </PageLayout>
    )
  }

  if (isEdit && (error || !existing)) {
    return (
      <PageLayout width="narrow">
        <PageHeader title="Booking unavailable" backTo="/bookings" backLabel="Back to Bookings" />
        <ContentCard><p style={{ margin: 0, color: '#dc2626' }}>Unable to load this booking record.</p></ContentCard>
      </PageLayout>
    )
  }

  return <BookingFormContent key={existing?.id ?? 'create'} existing={existing} />
}
