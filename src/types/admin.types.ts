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
  acl_roles?: Array<{ id: number; name: string }>
  bio?: string
  adresse?: string
  city?: string
  language?: string
  status: boolean
  /** FK ou relation chargée (API Laravel) */
  created_by?: number | { id: number; name: string; first_names: string; email?: string } | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface AdminListResponse {
  status: 'success'
  data: Admin[]
  pagination?: { current_page: number; per_page: number; total: number; last_page: number }
}

export interface AdminListParams {
  search?: string
  role?: string
  status?: boolean
  country_id?: number
  language?: string
  city?: string
  created_from?: string
  created_to?: string
  sort_by?: string | string[]
  sort_dir?: 'asc' | 'desc' | Array<'asc' | 'desc'>
  trashed?: 'without' | 'with' | 'only'
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
