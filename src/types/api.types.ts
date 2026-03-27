/**
 * API types - matches ngoni_admin_api_dev responses
 */

export interface ApiResponse<T> {
  status: 'success' | 'error'
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
}

export interface PaginatedMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface PaginatedResponse<T> {
  status: 'success'
  data: T[]
  pagination?: PaginatedMeta
  meta?: PaginatedMeta
}

// Auth types - API returns data.admin and data.token
export interface LoginRequest {
  email: string
  password: string
  device_name?: string
}

export interface AdminProfile {
  id: number
  name: string
  first_names?: string
  email: string
  role: string
  acl_roles?: string[]
  permissions?: string[]
  photo?: string | null
  first_contact?: string
  contact_second?: string
  country_id?: number
  adresse?: string
  status?: boolean
  created_at?: string
  updated_at?: string
}

export interface LoginResponse {
  status: 'success'
  message: string
  data: {
    admin: AdminProfile
    token: string
    token_type: string
  }
}

export interface ProfileResponse {
  status: 'success'
  data: AdminProfile
}

export interface RefreshResponse {
  status: 'success'
  message: string
  data: {
    token: string
    token_type: string
  }
}
