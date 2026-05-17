export interface Property {
  id: number
  owner_id: number
  name: string
  address: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreatePropertyData {
  name: string
  address: string
  description?: string
}

export interface UpdatePropertyData {
  name?: string
  address?: string
  description?: string | null
}
