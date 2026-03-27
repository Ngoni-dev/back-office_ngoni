import { apiClient } from './api/client'

export interface Video {
  id: number
  user_id: number
  title: string
  description?: string | null
  video_url?: string | null
  thumbnail_url?: string | null
  status?: string
  moderation_status?: string
  is_reported?: boolean
  is_sensitive?: boolean
  is_copyright_violation?: boolean
  created_at?: string
  user?: { id: number; username: string; display_name?: string | null }
}

export interface VideoListResponse {
  status: string
  data: Video[]
  pagination: { current_page: number; per_page: number; total: number; last_page: number }
}

export interface VideoAggregatedStats {
  total: number
  published: number
  processing: number
  rejected: number
  moderation_pending: number
  moderation_approved: number
  moderation_rejected: number
  reported: number
  sensitive: number
  copyright_violations: number
  created_last_7_days: number
  deleted_total: number
}

export interface PaginatedAny {
  status: string
  data: any[]
  pagination: { current_page: number; per_page: number; total: number; last_page: number }
  meta?: Record<string, unknown>
}

export class VideoService {
  async list(
    page = 1,
    perPage = 15,
    params?: { search?: string; status?: string; moderation_status?: string; is_reported?: boolean }
  ): Promise<VideoListResponse> {
    return apiClient.get<VideoListResponse>('/admin/videos', { params: { page, per_page: perPage, ...params } })
  }

  async get(id: number): Promise<{ status: string; data: Video }> {
    return apiClient.get<{ status: string; data: Video }>(`/admin/videos/${id}`)
  }

  async moderationQueue(page = 1, perPage = 15, params?: { search?: string }): Promise<VideoListResponse> {
    return apiClient.get<VideoListResponse>('/admin/videos/moderation-queue', {
      params: { page, per_page: perPage, ...params }
    })
  }

  async moderate(
    id: number,
    payload: { moderation_status: 'approved' | 'rejected' | 'pending'; is_sensitive?: boolean; is_copyright_violation?: boolean }
  ): Promise<{ status: string; data: Video; message?: string }> {
    return apiClient.patch<{ status: string; data: Video; message?: string }>(`/admin/videos/${id}/moderate`, payload)
  }

  async updateFlags(
    id: number,
    payload: { is_sensitive?: boolean; is_copyright_violation?: boolean }
  ): Promise<{ status: string; data: Video; message?: string }> {
    return apiClient.patch<{ status: string; data: Video; message?: string }>(`/admin/videos/${id}/flags`, payload)
  }

  async delete(id: number, reason: string): Promise<{ status: string; message?: string }> {
    return apiClient.delete<{ status: string; message?: string }>(`/admin/videos/${id}`, {
      data: { reason }
    })
  }

  async statsAggregated(): Promise<{ status: string; data: VideoAggregatedStats }> {
    return apiClient.get<{ status: string; data: VideoAggregatedStats }>('/admin/videos/stats-aggregated')
  }

  async ngoniPlus(page = 1, perPage = 15, params?: { search?: string }): Promise<PaginatedAny> {
    return apiClient.get<PaginatedAny>('/admin/videos/ngoni-plus', { params: { page, per_page: perPage, ...params } })
  }

  async shares(page = 1, perPage = 15, params?: { platform?: string }): Promise<PaginatedAny> {
    return apiClient.get<PaginatedAny>('/admin/videos/shares', { params: { page, per_page: perPage, ...params } })
  }

  async reposts(page = 1, perPage = 15): Promise<PaginatedAny> {
    return apiClient.get<PaginatedAny>('/admin/videos/reposts', { params: { page, per_page: perPage } })
  }

  async favoritesStats(page = 1, perPage = 15): Promise<PaginatedAny> {
    return apiClient.get<PaginatedAny>('/admin/videos/favorites-stats', { params: { page, per_page: perPage } })
  }
}

export const videoService = new VideoService()
