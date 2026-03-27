/**
 * Gift Product service - ngoni_admin_api_dev
 */

import { apiClient } from './api/client'
import type {
  GiftProduct,
  GiftProductListResponse,
  GiftProductOverviewResponse,
  GiftProductCreateRequest,
  GiftProductUpdateRequest
} from '@/types/gift.types'

export class GiftProductService {
  async overview(): Promise<GiftProductOverviewResponse> {
    return apiClient.get<GiftProductOverviewResponse>('/admin/gift-products/overview')
  }

  async list(page = 1, perPage = 15, filters?: { category?: string; is_active?: boolean }): Promise<GiftProductListResponse> {
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
    if (filters?.category) params.append('category', filters.category)
    // Backend PHP (bool) "false" = true ; envoyer "1" / "0" pour filtrer correctement
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active ? '1' : '0')
    const response = await apiClient.get<GiftProductListResponse>(
      `/admin/gift-products?${params.toString()}`
    )
    return response as unknown as GiftProductListResponse
  }

  async get(id: number): Promise<{ status: string; data: GiftProduct }> {
    return apiClient.get<{ status: string; data: GiftProduct }>(`/admin/gift-products/${id}`)
  }

  async create(data: GiftProductCreateRequest): Promise<{ status: string; data: GiftProduct }> {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('price', String(data.price))
    if (data.description) formData.append('description', data.description)
    if (data.category) formData.append('category', data.category)
    if (data.image) formData.append('image', data.image)
    if (data.animation) formData.append('animation', data.animation)
    return apiClient.post('/admin/gift-products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }

  async update(
    id: number,
    data: GiftProductUpdateRequest
  ): Promise<{ status: string; data: GiftProduct }> {
    const formData = new FormData()
    if (data.name) formData.append('name', data.name)
    if (data.price !== undefined) formData.append('price', String(data.price))
    if (data.description !== undefined) formData.append('description', data.description)
    if (data.category !== undefined) formData.append('category', data.category)
    if (data.image) formData.append('image', data.image)
    if (data.animation) formData.append('animation', data.animation)
    const hasFile = data.image ?? data.animation
    if (hasFile) {
      formData.append('_method', 'PUT')
      return apiClient.post(`/admin/gift-products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }
    return apiClient.put(`/admin/gift-products/${id}`, {
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category
    })
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete(`/admin/gift-products/${id}`)
  }

  async toggleActive(id: number): Promise<{ status: string; data: GiftProduct }> {
    return apiClient.patch(`/admin/gift-products/${id}/toggle-active`)
  }
}

export const giftProductService = new GiftProductService()
