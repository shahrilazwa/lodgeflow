import type { Facility } from '@/features/facilities/types'

export interface PropertyPhoto {
  id: number
  owner_id: number
  property_id: number
  path: string
  url: string
  caption: string | null
  sort_order: number
  is_cover: boolean
  created_at: string
  updated_at: string
}

export interface Property {
  id: number
  owner_id: number
  name: string
  address: string
  description: string | null
  is_active: boolean
  facilities?: Facility[]
  photos?: PropertyPhoto[]
  cover_photo?: PropertyPhoto | null
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
