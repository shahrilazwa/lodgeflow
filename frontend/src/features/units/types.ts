import type { Facility } from '@/features/facilities/types'

export const UNIT_TYPES = ['room', 'suite', 'dormitory_bed', 'entire_unit', 'whole_house'] as const
export type UnitType = (typeof UNIT_TYPES)[number]

export const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  room: 'Room',
  suite: 'Suite',
  dormitory_bed: 'Dormitory Bed',
  entire_unit: 'Entire Unit',
  whole_house: 'Whole House',
}

export interface Unit {
  id: number
  owner_id: number
  property_id: number
  name: string
  type: UnitType
  description: string | null
  price_per_night: string | null
  is_active: boolean
  facilities?: Facility[]
  created_at: string
  updated_at: string
}

export interface CreateUnitData {
  name: string
  type: UnitType
  description?: string
  price_per_night?: number | null
  facility_ids?: number[]
}

export interface UpdateUnitData {
  name?: string
  type?: UnitType
  description?: string | null
  price_per_night?: number | null
  facility_ids?: number[]
}
