export const BOOKING_STATUSES = ['confirmed', 'checked_in', 'checked_out', 'cancelled'] as const
export type BookingStatus = (typeof BOOKING_STATUSES)[number]

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  confirmed: 'Confirmed',
  checked_in: 'Checked In',
  checked_out: 'Checked Out',
  cancelled: 'Cancelled',
}

export const PAYMENT_STATUSES = ['unpaid', 'partial', 'paid', 'overpaid', 'refunded'] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'Unpaid',
  partial: 'Partial',
  paid: 'Paid',
  overpaid: 'Overpaid',
  refunded: 'Refunded',
}

export interface BookingUnit {
  id: number
  name: string
  type: string
}

export interface BookingGuest {
  id: number
  full_name: string
  phone: string
}

export interface Booking {
  id: number
  owner_id: number
  unit_id: number
  guest_id: number
  check_in_date: string
  check_out_date: string
  total_amount: string
  status: BookingStatus
  payment_status: PaymentStatus
  net_paid_amount: string
  unit?: BookingUnit
  guest?: BookingGuest
  created_at: string
  updated_at: string
}

export interface CreateBookingData {
  unit_id: number
  guest_id: number
  check_in_date: string
  check_out_date: string
  total_amount: number
}

export interface UpdateBookingData {
  check_in_date?: string
  check_out_date?: string
  total_amount?: number
}

export interface BookingFilters {
  status?: string
  unit_id?: string
  from_date?: string
  to_date?: string
}
