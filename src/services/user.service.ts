/**
 * User service - ngoni_admin_api_dev
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
  bio?: string | null
  city?: string | null
  followers_count?: number
  created_at: string
  deleted_at?: string | null
}

export interface UserKycHistoryResponse {
  status: string
  data: {
    user: { id: number; username: string; display_name?: string | null }
    kyc_documents: Array<{
      id: number
      document_type: string
      status: string
      rejection_reason?: string | null
      created_at?: string
      verified_at?: string | null
    }>
    certifications: Array<{
      id: number
      status: string
      has_certified_badge?: boolean
      submitted_at?: string | null
      reviewed_at?: string | null
      rejection_reason?: string | null
    }>
  }
}

export interface UserDetailResponse {
  status: string
  data: {
    user: User
    profile?: Record<string, unknown> | null
    wallet?: Record<string, unknown> | null
    stats: {
      videos_count: number
      subscriptions_count: number
      transactions_count: number
      active_sessions_count: number
    }
    recent_videos: Array<{ id: number; title?: string | null; moderation_status?: string | null; created_at?: string | null }>
    recent_subscriptions: Array<Record<string, unknown>>
    recent_transactions: Array<{
      id: number
      type?: string | null
      amount?: number | string | null
      net_amount?: number | string | null
      currency?: string | null
      status?: string | null
      reference_id?: string | null
      created_at?: string | null
    }>
    active_sessions: Array<{
      id: string
      ip_address?: string | null
      user_agent?: string | null
      last_activity_at?: string | null
    }>
  }
}

export interface UserListParams {
  search?: string
  status?: string
  role?: string
  country_id?: number
  created_from?: string
  created_to?: string
  sort_by?: string | string[]
  sort_dir?: 'asc' | 'desc' | Array<'asc' | 'desc'>
  trashed?: 'without' | 'with' | 'only'
}

export interface UserListResponse {
  status: string
  data: User[]
  pagination: { current_page: number; per_page: number; total: number; last_page: number }
}

export interface UserOverviewTotals {
  users: number
  active: number
  suspended: number
  banned: number
  pending_verification: number
  archived: number
}

export interface UserOverviewTrends7d {
  labels: string[]
  users_created: number[]
  creators_created: number[]
  business_created: number[]
  archived: number[]
}

export interface UserOverviewData {
  totals: UserOverviewTotals
  trends_7d: UserOverviewTrends7d
}

export interface UserOverviewResponse {
  status: string
  data: UserOverviewData
}

export class UserService {
  async overview(): Promise<UserOverviewResponse> {
    return apiClient.get<UserOverviewResponse>('/admin/users/overview')
  }

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

  async get(id: number): Promise<UserDetailResponse> {
    return apiClient.get<UserDetailResponse>(`/admin/users/${id}`)
  }

  async updateStatus(
    id: number,
    status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING_VERIFICATION'
  ): Promise<{ status: string; data: User; message?: string }> {
    return apiClient.patch<{ status: string; data: User; message?: string }>(`/admin/users/${id}/status`, { status })
  }

  async updateRole(
    id: number,
    role: 'PERSONAL' | 'BUSINESS' | 'CREATOR'
  ): Promise<{ status: string; data: User; message?: string }> {
    return apiClient.patch<{ status: string; data: User; message?: string }>(`/admin/users/${id}/role`, { role })
  }

  async delete(id: number): Promise<{ status: string; message?: string }> {
    return apiClient.delete<{ status: string; message?: string }>(`/admin/users/${id}`)
  }

  async restore(id: number): Promise<{ status: string; data: User; message?: string }> {
    return apiClient.patch<{ status: string; data: User; message?: string }>(`/admin/users/${id}/restore`)
  }

  async kycHistory(id: number): Promise<UserKycHistoryResponse> {
    return apiClient.get<UserKycHistoryResponse>(`/admin/users/${id}/kyc-history`)
  }

  async exportCsv(params?: UserListParams): Promise<Blob> {
    const axios = apiClient.getAxiosInstance()
    const res = await axios.get('/admin/users/export-csv', {
      params,
      responseType: 'blob'
    })
    return res.data as Blob
  }
}

export const userService = new UserService()
