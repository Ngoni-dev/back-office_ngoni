/**
 * Role service - ngoni_admin_api_dev (BO-006)
 */

import { apiClient } from './api/client'

export interface Role {
  id: number
  name: string
  description?: string
  created_at?: string
  updated_at?: string
}

export class RoleService {
  async list(): Promise<{ status: string; data: Role[] }> {
    return apiClient.get<{ status: string; data: Role[] }>('/admin/roles')
  }

  async get(id: number): Promise<{ status: string; data: Role }> {
    return apiClient.get<{ status: string; data: Role }>(`/admin/roles/${id}`)
  }

  async create(data: { name: string; description?: string }): Promise<{ status: string; data: Role }> {
    return apiClient.post<{ status: string; data: Role }>('/admin/roles', data)
  }

  async update(id: number, data: { name?: string; description?: string }): Promise<{ status: string; data: Role }> {
    return apiClient.put<{ status: string; data: Role }>(`/admin/roles/${id}`, data)
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete(`/admin/roles/${id}`)
  }
}

export const roleService = new RoleService()
