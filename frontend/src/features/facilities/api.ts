import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Facility, FacilityScope } from './types'

const FACILITIES_KEY = ['facilities']

export interface CreateFacilityData {
  name: string
  category: string
  scope: FacilityScope
  icon?: string | null
}

export function useFacilities() {
  return useQuery({
    queryKey: FACILITIES_KEY,
    queryFn: async () => {
      const { data } = await api.get<{ data: Facility[] }>('/facilities')
      return data.data
    },
  })
}

export function useCreateFacility() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateFacilityData) => {
      const { data } = await api.post<{ data: Facility }>('/facilities', payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FACILITIES_KEY })
    },
  })
}
