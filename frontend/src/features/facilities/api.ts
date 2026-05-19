import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Facility } from './types'

const FACILITIES_KEY = ['facilities']

export function useFacilities() {
  return useQuery({
    queryKey: FACILITIES_KEY,
    queryFn: async () => {
      const { data } = await api.get<{ data: Facility[] }>('/facilities')
      return data.data
    },
  })
}
