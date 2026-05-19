export type FacilityScope = 'property' | 'unit' | 'both'

export interface Facility {
  id: number
  name: string
  icon: string | null
  category: string | null
  scope: FacilityScope
  created_at: string
  updated_at: string
}
