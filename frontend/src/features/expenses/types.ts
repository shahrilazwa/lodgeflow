export const EXPENSE_CATEGORIES = [
  'utility_bills', 'maintenance', 'cleaning_services', 'laundry_services',
  'supplies', 'internet', 'platform_fees', 'repairs', 'insurance', 'tax', 'other',
] as const
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  utility_bills: 'Utility Bills',
  maintenance: 'Maintenance',
  cleaning_services: 'Cleaning Services',
  laundry_services: 'Laundry Services',
  supplies: 'Supplies',
  internet: 'Internet',
  platform_fees: 'Platform Fees',
  repairs: 'Repairs',
  insurance: 'Insurance',
  tax: 'Tax',
  other: 'Other',
}

export interface Expense {
  id: number
  owner_id: number
  property_id: number
  unit_id: number | null
  booking_id: number | null
  service_provider_id: number | null
  cleaning_task_id: number | null
  maintenance_task_id: number | null
  amount: string
  date: string
  category: ExpenseCategory
  description: string | null
  created_at: string
  updated_at: string
}

export interface CreateExpenseData {
  amount: number
  date: string
  category: ExpenseCategory
  property_id: number
  description?: string
  unit_id?: number
  booking_id?: number
  service_provider_id?: number
}

export interface UpdateExpenseData {
  amount?: number
  date?: string
  category?: ExpenseCategory
  property_id?: number
  description?: string | null
  unit_id?: number | null
  booking_id?: number | null
  service_provider_id?: number | null
}
