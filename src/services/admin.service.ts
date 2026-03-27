/**
 * Admin service - ngoni_admin_api_dev
 */

import { apiClient } from './api/client'
import type {
  Admin,
  AdminListResponse,
  AdminCreateRequest,
  AdminUpdateRequest,
  AdminListParams
} from '@/types/admin.types'

export class AdminService {
  async list(page = 1, perPage = 15, params?: AdminListParams): Promise<AdminListResponse> {
    const res = await apiClient.get<AdminListResponse>('/admin/administrateurs', {
      params: { page, per_page: perPage, ...params }
    })
    return res as unknown as AdminListResponse
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

  async restore(id: number): Promise<{ status: string; data: Admin; message?: string }> {
    return apiClient.patch<{ status: string; data: Admin; message?: string }>(`/admin/administrateurs/${id}/restore`)
  }

  async exportCsv(params?: AdminListParams): Promise<Blob> {
    const axios = apiClient.getAxiosInstance()
    const res = await axios.get('/admin/administrateurs/export-csv', {
      params,
      responseType: 'blob'
    })
    return res.data as Blob
  }
}

export const adminService = new AdminService()
