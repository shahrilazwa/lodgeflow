export const PAYMENT_TYPES = ['payment', 'refund'] as const
export type PaymentType = (typeof PAYMENT_TYPES)[number]

export const PAYMENT_METHODS = ['cash', 'bank_transfer', 'other'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  other: 'Other',
}

export interface Payment {
  id: number
  owner_id: number
  booking_id: number
  type: PaymentType
  amount: string
  payment_date: string
  payment_method: PaymentMethod
  created_at: string
  updated_at: string
}

export interface CreatePaymentData {
  type: PaymentType
  amount: number
  payment_date: string
  payment_method: PaymentMethod
}
