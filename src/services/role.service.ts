/**
 * Role service - ngoni_admin_api_dev
 */

import { apiClient } from './api/client'

export interface Role {
  id: number
  name: string
  description?: string
  permissions?: Array<{ id: number; name: string; description?: string }>
  created_at?: string
  updated_at?: string
}

export interface Permission {
  id: number
  name: string
  description?: string
}

export interface RoleListParams {
  search?: string
  created_from?: string
  created_to?: string
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
}

export interface RoleListResponse {
  status: string
  data: Role[]
  pagination?: { current_page: number; per_page: number; total: number; last_page: number }
}

export class RoleService {
  async list(page = 1, perPage = 15, params?: RoleListParams): Promise<RoleListResponse> {
    const res = await apiClient.get<RoleListResponse>('/admin/roles', {
      params: { page, per_page: perPage, ...params }
    })
    return res as unknown as RoleListResponse
  }

  async get(id: number): Promise<{ status: string; data: Role }> {
    return apiClient.get<{ status: string; data: Role }>(`/admin/roles/${id}`)
  }

  async create(data: { name: string; description?: string; permission_ids?: number[] }): Promise<{ status: string; data: Role }> {
    return apiClient.post<{ status: string; data: Role }>('/admin/roles', data)
  }

  async update(id: number, data: { name?: string; description?: string; permission_ids?: number[] }): Promise<{ status: string; data: Role }> {
    return apiClient.put<{ status: string; data: Role }>(`/admin/roles/${id}`, data)
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete(`/admin/roles/${id}`)
  }

  async permissions(): Promise<{ status: string; data: Permission[] }> {
    return apiClient.get<{ status: string; data: Permission[] }>('/admin/permissions')
  }
}

export const roleService = new RoleService()
