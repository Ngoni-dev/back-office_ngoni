/**
 * Music service - ngoni_admin_api_dev
 */

import { apiClient } from './api/client'
import type {
  Music,
  MusicListResponse,
  MusicSearchParams,
  MusicCreateRequest,
  MusicUpdateRequest,
  MusicStatus
} from '@/types/music.types'

type RequestConfig = import('axios').AxiosRequestConfig & { skip404Toast?: boolean }

export class MusicService {
  async list(page = 1, perPage = 15, config?: RequestConfig): Promise<MusicListResponse> {
    const response = await apiClient.get<MusicListResponse>(
      `/admin/musics?page=${page}&per_page=${perPage}`,
      config
    )
    return response as unknown as MusicListResponse
  }

  async search(params: MusicSearchParams, config?: RequestConfig): Promise<MusicListResponse> {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') qs.append(k, String(v))
    })
    const response = await apiClient.get<MusicListResponse>(
      `/admin/musics/search?${qs.toString()}`,
      config
    )
    return response as unknown as MusicListResponse
  }

  async get(id: number): Promise<{ status: string; data: Music }> {
    return apiClient.get<{ status: string; data: Music }>(`/admin/musics/${id}`)
  }

  async create(data: MusicCreateRequest): Promise<{ status: string; data: Music }> {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('audio_file', data.audio_file)
    if (data.country_id) formData.append('country_id', String(data.country_id))
    if (data.language) formData.append('language', data.language)
    // Backend expects 1 or 0 for boolean (Laravel form validation)
    formData.append('is_original', data.is_original === true ? '1' : '0')
    if (data.artist_ids?.length)
      data.artist_ids.forEach(id => formData.append('artist_ids[]', String(id)))
    if (data.genre_ids?.length)
      data.genre_ids.forEach(id => formData.append('genre_ids[]', String(id)))
    return apiClient.post(`/admin/musics`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }

  async update(id: number, data: MusicUpdateRequest): Promise<{ status: string; data: Music }> {
    return apiClient.put(`/admin/musics/${id}`, data)
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete(`/admin/musics/${id}`)
  }

  async updateStatus(id: number, status: MusicStatus): Promise<{ status: string; data: Music }> {
    return apiClient.patch(`/admin/musics/${id}/status`, { status })
  }
}

export const musicService = new MusicService()
