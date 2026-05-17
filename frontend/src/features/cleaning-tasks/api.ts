import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { CleaningTask, CreateCleaningTaskData } from './types'

const CT_KEY = ['cleaning-tasks']

export function useCleaningTasks(filters?: { status?: string; unit_id?: string }) {
  return useQuery({
    queryKey: [...CT_KEY, filters],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (filters?.status) params.status = filters.status
      if (filters?.unit_id) params.unit_id = filters.unit_id
      const { data } = await api.get<{ data: CleaningTask[] }>('/cleaning-tasks', { params })
      return data.data
    },
  })
}

export function useCreateCleaningTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateCleaningTaskData) => {
      const { data } = await api.post<{ data: CleaningTask }>('/cleaning-tasks', payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CT_KEY })
    },
  })
}

export function useUpdateCleaningTaskStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const { data } = await api.patch<{ data: CleaningTask }>(`/cleaning-tasks/${id}/status`, { status })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CT_KEY })
    },
  })
}

export function useUpdateCleaningTaskNotes() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string | null }) => {
      const { data } = await api.patch<{ data: CleaningTask }>(`/cleaning-tasks/${id}/notes`, { notes })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CT_KEY })
    },
  })
}
