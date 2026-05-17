export interface Guest {
  id: number
  owner_id: number
  full_name: string
  phone: string
  email: string | null
  identification_number: string | null
  created_at: string
  updated_at: string
}

export interface CreateGuestData {
  full_name: string
  phone: string
  email?: string
  identification_number?: string
}

export interface UpdateGuestData {
  full_name?: string
  phone?: string
  email?: string | null
  identification_number?: string | null
}
