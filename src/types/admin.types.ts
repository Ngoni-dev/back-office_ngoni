/**
 * Administrateur types - ngoni_admin_api_dev
 */

export interface Admin {
  id: number
  name: string
  first_names: string
  email: string
  role: string
  first_contact: string
  contact_second?: string
  photo?: string
  country_id: number
  country?: { id: number; name: string; code: string }
  bio?: string
  adresse?: string
  city?: string
  language?: string
  status: boolean
  created_at?: string
  updated_at?: string
}

export interface AdminListResponse {
  status: 'success'
  data: Admin[]
  pagination?: { current_page: number; per_page: number; total: number; last_page: number }
}

export interface AdminCreateRequest {
  name: string
  first_names: string
  email: string
  password: string
  password_confirmation: string
  role: string
  first_contact: string
  contact_second?: string
  country_id: number
  bio?: string
  adresse?: string
  city?: string
  language?: string
}

export interface AdminUpdateRequest {
  name?: string
  first_names?: string
  email?: string
  password?: string
  password_confirmation?: string
  role?: string
  first_contact?: string
  contact_second?: string
  country_id?: number
  bio?: string
  adresse?: string
  city?: string
  language?: string
  status?: boolean
}
