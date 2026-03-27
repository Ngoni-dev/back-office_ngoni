/**
 * Country service - ngoni_admin_api_dev
 */

import { apiClient } from './api/client'

export interface Country {
  id: number
  name: string
  code: string
}

export interface CountryListResponse {
  status: string
  data: Country[]
  pagination?: { current_page: number; per_page: number; total: number; last_page: number }
}

export class CountryService {
  /** Liste complète pour select/dropdown (AdminForm, etc.) */
  async list(): Promise<{ status: string; data: Country[] }> {
    return apiClient.get<{ status: string; data: Country[] }>('/admin/countries', {
      params: { for_select: 1 }
    })
  }

  /** Liste paginée pour CRUD */
  async listPaginated(
    page = 1,
    perPage = 15,
    params?: { search?: string }
  ): Promise<CountryListResponse> {
    const res = await apiClient.get<CountryListResponse>('/admin/countries', {
      params: { page, per_page: perPage, search: params?.search }
    })
    return res as CountryListResponse
  }

  async get(id: number): Promise<{ status: string; data: Country }> {
    return apiClient.get<{ status: string; data: Country }>(`/admin/countries/${id}`)
  }

  async create(data: { name: string; code: string }): Promise<{ status: string; data: Country }> {
    return apiClient.post<{ status: string; data: Country }>('/admin/countries', data)
  }

  async update(id: number, data: Partial<{ name: string; code: string }>): Promise<{ status: string; data: Country }> {
    return apiClient.put<{ status: string; data: Country }>(`/admin/countries/${id}`, data)
  }

  async delete(id: number): Promise<{ status: string }> {
    return apiClient.delete<{ status: string }>(`/admin/countries/${id}`)
  }
}

export const countryService = new CountryService()
