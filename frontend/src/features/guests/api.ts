import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { CreateGuestData, Guest, UpdateGuestData } from './types'

const GUESTS_KEY = ['guests']

export function useGuests(search?: string) {
  return useQuery({
    queryKey: [...GUESTS_KEY, { search }],
    queryFn: async () => {
      const params = search ? { search } : {}
      const { data } = await api.get<{ data: Guest[] }>('/guests', { params })
      return data.data
    },
  })
}

export function useGuest(id: number) {
  return useQuery({
    queryKey: [...GUESTS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<{ data: Guest }>(`/guests/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export function useCreateGuest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateGuestData) => {
      const { data } = await api.post<{ data: Guest }>('/guests', payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GUESTS_KEY })
    },
  })
}

export function useUpdateGuest(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateGuestData) => {
      const { data } = await api.put<{ data: Guest }>(`/guests/${id}`, payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GUESTS_KEY })
    },
  })
}
