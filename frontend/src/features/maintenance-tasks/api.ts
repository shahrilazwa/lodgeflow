import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { CreateMaintenanceTaskData, MaintenanceTask, UpdateMaintenanceTaskData } from './types'

const MT_KEY = ['maintenance-tasks']

export function useMaintenanceTasks(filters?: { status?: string; priority?: string }) {
  return useQuery({
    queryKey: [...MT_KEY, filters],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (filters?.status) params.status = filters.status
      if (filters?.priority) params.priority = filters.priority
      const { data } = await api.get<{ data: MaintenanceTask[] }>('/maintenance-tasks', { params })
      return data.data
    },
  })
}

export function useMaintenanceTask(id: number) {
  return useQuery({
    queryKey: [...MT_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<{ data: MaintenanceTask }>(`/maintenance-tasks/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export function useCreateMaintenanceTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateMaintenanceTaskData) => {
      const { data } = await api.post<{ data: MaintenanceTask }>('/maintenance-tasks', payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MT_KEY })
    },
  })
}

export function useUpdateMaintenanceTask(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateMaintenanceTaskData) => {
      const { data } = await api.put<{ data: MaintenanceTask }>(`/maintenance-tasks/${id}`, payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MT_KEY })
    },
  })
}
