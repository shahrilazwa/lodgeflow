export const CLEANING_TASK_STATUSES = ['pending', 'in_progress', 'completed'] as const
export type CleaningTaskStatus = (typeof CLEANING_TASK_STATUSES)[number]

export const CLEANING_STATUS_LABELS: Record<CleaningTaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
}

export interface CleaningTask {
  id: number
  owner_id: number
  unit_id: number
  booking_id: number | null
  status: CleaningTaskStatus
  notes: string | null
  unit?: { id: number; name: string }
  booking?: { id: number; check_in_date: string; check_out_date: string } | null
  created_at: string
  updated_at: string
}

export interface CreateCleaningTaskData {
  unit_id: number
  booking_id?: number
}
