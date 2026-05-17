import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { CreatePropertyData, Property, UpdatePropertyData } from './types'

const PROPERTIES_KEY = ['properties']

export function useProperties() {
  return useQuery({
    queryKey: PROPERTIES_KEY,
    queryFn: async () => {
      const { data } = await api.get<{ data: Property[] }>('/properties')
      return data.data
    },
  })
}

export function useProperty(id: number) {
  return useQuery({
    queryKey: [...PROPERTIES_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<{ data: Property }>(`/properties/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export function useCreateProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreatePropertyData) => {
      const { data } = await api.post<{ data: Property }>('/properties', payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTIES_KEY })
    },
  })
}

export function useUpdateProperty(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdatePropertyData) => {
      const { data } = await api.put<{ data: Property }>(`/properties/${id}`, payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTIES_KEY })
    },
  })
}

export function useDeleteProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/properties/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTIES_KEY })
    },
  })
}

export function useDeactivateProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch<{ data: Property }>(`/properties/${id}/deactivate`)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTIES_KEY })
    },
  })
}

export function useActivateProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch<{ data: Property }>(`/properties/${id}/activate`)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTIES_KEY })
    },
  })
}
