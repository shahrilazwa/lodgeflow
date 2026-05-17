export const MT_STATUSES = ['open', 'in_progress', 'completed', 'cancelled'] as const
export type MTStatus = (typeof MT_STATUSES)[number]

export const MT_STATUS_LABELS: Record<MTStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const MT_PRIORITIES = ['low', 'medium', 'high'] as const
export type MTPriority = (typeof MT_PRIORITIES)[number]

export const MT_PRIORITY_LABELS: Record<MTPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export interface MaintenanceTask {
  id: number
  owner_id: number
  property_id: number | null
  unit_id: number | null
  service_provider_id: number | null
  title: string
  description: string | null
  priority: MTPriority
  status: MTStatus
  scheduled_date: string | null
  property?: { id: number; name: string } | null
  unit?: { id: number; name: string } | null
  service_provider?: { id: number; name: string } | null
  created_at: string
  updated_at: string
}

export interface CreateMaintenanceTaskData {
  title: string
  priority: MTPriority
  property_id?: number
  unit_id?: number
  service_provider_id?: number
  description?: string
  scheduled_date?: string
}

export interface UpdateMaintenanceTaskData {
  title?: string
  priority?: MTPriority
  status?: MTStatus
  property_id?: number | null
  unit_id?: number | null
  service_provider_id?: number | null
  description?: string | null
  scheduled_date?: string | null
}
