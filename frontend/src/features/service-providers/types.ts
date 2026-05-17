export interface ServiceProvider {
  id: number
  owner_id: number
  name: string
  service_type: string
  phone: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CreateServiceProviderData {
  name: string
  service_type: string
  phone?: string
  notes?: string
}

export interface UpdateServiceProviderData {
  name?: string
  service_type?: string
  phone?: string | null
  notes?: string | null
}
