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

export const BED_TYPES = ['single', 'double', 'queen', 'king', 'bunk', 'sofa_bed', 'floor_mattress'] as const
export type BedType = (typeof BED_TYPES)[number]

export const BED_TYPE_LABELS: Record<BedType, string> = {
  single: 'Single bed',
  double: 'Double bed',
  queen: 'Queen bed',
  king: 'King bed',
  bunk: 'Bunk bed / double decker',
  sofa_bed: 'Sofa bed',
  floor_mattress: 'Floor mattress',
}

export const BED_TYPE_DEFAULT_CAPACITY: Record<BedType, number> = {
  single: 1,
  double: 2,
  queen: 2,
  king: 2,
  bunk: 2,
  sofa_bed: 1,
  floor_mattress: 1,
}

export const OCCUPANCY_SOURCES = ['calculated', 'manual'] as const
export type OccupancySource = (typeof OCCUPANCY_SOURCES)[number]

export interface UnitBed {
  id?: number
  unit_id?: number
  bed_type: BedType
  quantity: number
  capacity_per_bed: number
}

export interface Unit {
  id: number
  owner_id: number
  property_id: number
  name: string
  type: UnitType
  description: string | null
  price_per_night: string | null
  max_occupancy: number | null
  occupancy_source: OccupancySource
  is_active: boolean
  beds?: UnitBed[]
  facilities?: Facility[]
  created_at: string
  updated_at: string
}

export interface CreateUnitData {
  name: string
  type: UnitType
  description?: string
  price_per_night?: number | null
  max_occupancy?: number | null
  occupancy_source?: OccupancySource
  beds?: Array<Omit<UnitBed, 'id' | 'unit_id'>>
  facility_ids?: number[]
}

export interface UpdateUnitData {
  name?: string
  type?: UnitType
  description?: string | null
  price_per_night?: number | null
  max_occupancy?: number | null
  occupancy_source?: OccupancySource
  beds?: Array<Omit<UnitBed, 'id' | 'unit_id'>>
  facility_ids?: number[]
}
