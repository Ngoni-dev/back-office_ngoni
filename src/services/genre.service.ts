/**
 * Genre service - ngoni_admin_api_dev
 */

import { apiClient } from './api/client'
import type {
  Genre,
  GenreListResponse,
  GenreCreateRequest,
  GenreUpdateRequest,
  AttachGenreRequest
} from '@/types/genre.types'

export class GenreService {
  async list(page = 1, perPage = 50): Promise<GenreListResponse> {
    const response = await apiClient.get<GenreListResponse>(
      `/admin/genres?page=${page}&per_page=${perPage}`
    )
    return response as unknown as GenreListResponse
  }

  async get(id: number): Promise<{ status: string; data: Genre }> {
    return apiClient.get<{ status: string; data: Genre }>(`/admin/genres/${id}`)
  }

  /**
   * Récupère les musiques associées à un genre (si l'API expose cet endpoint).
   * Sinon la liste vient de GET genre quand le backend inclut musics dans GenreResource.
   */
  async getMusics(genreId: number): Promise<{ status: string; data: import('@/types/music.types').Music[] }> {
    return apiClient.get<{ status: string; data: import('@/types/music.types').Music[] }>(
      `/admin/genres/${genreId}/musics`,
      { skip404Toast: true } as import('axios').AxiosRequestConfig
    )
  }

  async create(data: GenreCreateRequest): Promise<{ status: string; data: Genre }> {
    return apiClient.post('/admin/genres', data)
  }

  async update(id: number, data: GenreUpdateRequest): Promise<{ status: string; data: Genre }> {
    return apiClient.put(`/admin/genres/${id}`, data)
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete(`/admin/genres/${id}`)
  }

  async attachToMusic(data: AttachGenreRequest): Promise<void> {
    return apiClient.post('/admin/genres/attach', data)
  }

  async detachFromMusic(musicId: number, genreId: number): Promise<void> {
    return apiClient.delete(`/admin/genres/${musicId}/${genreId}/detach`)
  }
}

export const genreService = new GenreService()
