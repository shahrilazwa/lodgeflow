import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { CreateUnitData, Unit, UpdateUnitData } from './types'

const UNITS_KEY = ['units']

export function useUnitsForProperty(propertyId: number) {
  return useQuery({
    queryKey: [...UNITS_KEY, 'property', propertyId],
    queryFn: async () => {
      const { data } = await api.get<{ data: Unit[] }>(`/properties/${propertyId}/units`)
      return data.data
    },
    enabled: !!propertyId,
  })
}

export function useUnit(id: number) {
  return useQuery({
    queryKey: [...UNITS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<{ data: Unit }>(`/units/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export function useCreateUnit(propertyId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateUnitData) => {
      const { data } = await api.post<{ data: Unit }>(`/properties/${propertyId}/units`, payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...UNITS_KEY, 'property', propertyId] })
    },
  })
}

export function useUpdateUnit(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateUnitData) => {
      const { data } = await api.put<{ data: Unit }>(`/units/${id}`, payload)
      return data.data
    },
    onSuccess: (updatedUnit) => {
      queryClient.invalidateQueries({ queryKey: [...UNITS_KEY, 'property', updatedUnit.property_id] })
      queryClient.invalidateQueries({ queryKey: [...UNITS_KEY, id] })
    },
  })
}

export function useDeactivateUnit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch<{ data: Unit }>(`/units/${id}/deactivate`)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UNITS_KEY })
    },
  })
}

export function useActivateUnit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch<{ data: Unit }>(`/units/${id}/activate`)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UNITS_KEY })
    },
  })
}
