import type { Facility } from '@/features/facilities/types'

export interface Property {
  id: number
  owner_id: number
  name: string
  address: string
  description: string | null
  is_active: boolean
  facilities?: Facility[]
  created_at: string
  updated_at: string
}

export interface CreatePropertyData {
  name: string
  address: string
  description?: string
  facility_ids?: number[]
}

export interface UpdatePropertyData {
  name?: string
  address?: string
  description?: string | null
  facility_ids?: number[]
}
