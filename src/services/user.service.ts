/**
 * User service - ngoni_admin_api_dev (BO-013)
 */

import { apiClient } from './api/client'

export interface User {
  id: number
  username: string
  display_name?: string | null
  phone_number?: string | null
  country_id?: number | null
  country?: { id: number; name: string; code: string } | null
  role: 'PERSONAL' | 'BUSINESS' | 'CREATOR'
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING_VERIFICATION'
  kyc_status: string
  avatar_url?: string | null
  followers_count?: number
  created_at: string
}

export interface UserListParams {
  search?: string
  status?: string
  role?: string
  country_id?: number
}

export interface UserListResponse {
  status: string
  data: User[]
  pagination: { current_page: number; per_page: number; total: number; last_page: number }
}

export class UserService {
  async list(
    page = 1,
    perPage = 15,
    params?: UserListParams
  ): Promise<UserListResponse> {
    const res = await apiClient.get<UserListResponse>('/admin/users', {
      params: { page, per_page: perPage, ...params }
    })
    return res as UserListResponse
  }

  async get(id: number): Promise<{ status: string; data: User }> {
    return apiClient.get<{ status: string; data: User }>(`/admin/users/${id}`)
  }
}

export const userService = new UserService()
