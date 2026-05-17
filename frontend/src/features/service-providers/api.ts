import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { CreateServiceProviderData, ServiceProvider, UpdateServiceProviderData } from './types'

const SP_KEY = ['service-providers']

export function useServiceProviders() {
  return useQuery({
    queryKey: SP_KEY,
    queryFn: async () => {
      const { data } = await api.get<{ data: ServiceProvider[] }>('/service-providers')
      return data.data
    },
  })
}

export function useServiceProvider(id: number) {
  return useQuery({
    queryKey: [...SP_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<{ data: ServiceProvider }>(`/service-providers/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export function useCreateServiceProvider() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateServiceProviderData) => {
      const { data } = await api.post<{ data: ServiceProvider }>('/service-providers', payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SP_KEY })
    },
  })
}

export function useUpdateServiceProvider(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateServiceProviderData) => {
      const { data } = await api.put<{ data: ServiceProvider }>(`/service-providers/${id}`, payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SP_KEY })
    },
  })
}

export function useDeleteServiceProvider() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/service-providers/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SP_KEY })
    },
  })
}
