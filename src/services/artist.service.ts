/**
 * Artist service - ngoni_admin_api_dev
 */

import { apiClient } from './api/client'
import type {
  Artist,
  ArtistListResponse,
  ArtistCreateRequest,
  ArtistUpdateRequest,
  AttachArtistRequest
} from '@/types/artist.types'

export class ArtistService {
  async list(page = 1, perPage = 15): Promise<ArtistListResponse> {
    const response = await apiClient.get<ArtistListResponse>(
      `/admin/artists?page=${page}&per_page=${perPage}`
    )
    return response as unknown as ArtistListResponse
  }

  async get(id: number): Promise<{ status: string; data: Artist }> {
    return apiClient.get<{ status: string; data: Artist }>(`/admin/artists/${id}`)
  }

  /**
   * Récupère les musiques associées à un artiste.
   * Utilise l'endpoint dédié si disponible (404 = non implémenté, pas de toast).
   */
  async getMusics(artistId: number): Promise<{ status: string; data: import('@/types/music.types').Music[] }> {
    return apiClient.get<{ status: string; data: import('@/types/music.types').Music[] }>(
      `/admin/artists/${artistId}/musics`,
      { skip404Toast: true } as import('axios').AxiosRequestConfig
    )
  }

  async create(data: ArtistCreateRequest): Promise<{ status: string; data: Artist }> {
    const formData = new FormData()
    formData.append('name', data.name)
    if (data.bio) formData.append('bio', data.bio)
    const file = data.profile_image ?? data.profile_image_url
    if (file) formData.append('profile_image', file)
    return apiClient.post(`/admin/artists`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }

  async update(id: number, data: ArtistUpdateRequest): Promise<{ status: string; data: Artist }> {
    const file = data.profile_image ?? data.profile_image_url
    if (file) {
      const formData = new FormData()
      formData.append('_method', 'PUT')
      if (data.name) formData.append('name', data.name)
      if (data.bio !== undefined) formData.append('bio', data.bio)
      formData.append('profile_image', file)
      return apiClient.post(`/admin/artists/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }
    return apiClient.put(`/admin/artists/${id}`, {
      name: data.name,
      bio: data.bio
    })
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete(`/admin/artists/${id}`)
  }

  async verify(id: number): Promise<{ status: string; data: Artist }> {
    return apiClient.patch(`/admin/artists/${id}/verify`)
  }

  async unverify(id: number): Promise<{ status: string; data: Artist }> {
    return apiClient.patch(`/admin/artists/${id}/unverify`)
  }

  async attachToMusic(data: AttachArtistRequest): Promise<void> {
    await apiClient.post('/admin/artists/attach', {
      music_id: data.music_id,
      artist_id: data.artist_id,
      ...(data.role && { role: data.role })
    })
  }

  /**
   * Détache un artiste d'une musique.
   * Backend: DELETE /admin/artists/{musicId}/{artistId}/detach
   */
  async detachFromMusic(musicId: number, artistId: number): Promise<void> {
    await apiClient.delete(`/admin/artists/${musicId}/${artistId}/detach`)
  }
}

export const artistService = new ArtistService()
