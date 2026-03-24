/**
 * Admin service - ngoni_admin_api_dev (BO-005)
 */

import { apiClient } from './api/client'
import type {
  Admin,
  AdminListResponse,
  AdminCreateRequest,
  AdminUpdateRequest
} from '@/types/admin.types'

export class AdminService {
  async list(page = 1, perPage = 15, params?: { search?: string; role?: string; status?: boolean }): Promise<AdminListResponse> {
    const searchParams = new URLSearchParams({ page: String(page), per_page: String(perPage) })
    if (params?.search) searchParams.set('search', params.search)
    if (params?.role) searchParams.set('role', params.role)
    if (params?.status !== undefined) searchParams.set('status', String(params.status ? 1 : 0))
    const response = await apiClient.get<AdminListResponse>(`/admin/administrateurs?${searchParams}`)
    return response as unknown as AdminListResponse
  }

  async get(id: number): Promise<{ status: string; data: Admin }> {
    return apiClient.get<{ status: string; data: Admin }>(`/admin/administrateurs/${id}`)
  }

  async create(data: AdminCreateRequest): Promise<{ status: string; data: Admin }> {
    return apiClient.post<{ status: string; data: Admin }>('/admin/administrateurs', data)
  }

  async update(id: number, data: AdminUpdateRequest): Promise<{ status: string; data: Admin }> {
    return apiClient.put<{ status: string; data: Admin }>(`/admin/administrateurs/${id}`, data)
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete(`/admin/administrateurs/${id}`)
  }

  async toggleStatus(id: number): Promise<{ status: string; data: { status: boolean } }> {
    return apiClient.patch<{ status: string; data: { status: boolean } }>(`/admin/administrateurs/${id}/toggle-status`)
  }
}

export const adminService = new AdminService()
