import { apiClient } from './api/client'

export interface HashtagRecord {
  id: number
  name?: string | null
  slug?: string | null
  tag?: string | null
  display_tag?: string | null
  usage_count?: number | null
  videos_count?: number | null
  views_count?: number | null
  last_used_at?: string | null
  is_blocked?: boolean | null
  block_reason?: string | null
  is_trending?: boolean | null
  created_at?: string | null
  updated_at?: string | null
}

export interface Paginated<T> {
  status: string
  data: T[]
  pagination: { current_page: number; per_page: number; total: number; last_page: number }
  meta?: Record<string, unknown>
}

export interface HashtagTrendsData {
  rankings: Array<{
    hashtag_id: number
    hashtag_label: string
    region: string | null
    usage_sum: number
    views_sum: number
    last_date: string | null
  }>
  series: Array<{ date: string; usage_count: number; views_count: number }>
}

export interface VideoHashtagLink {
  link_id: number
  video_id: number
  video_title?: string | null
  views_from_hashtag?: number | null
  engagement_rate?: number | string | null
  position?: number | null
}

export interface CommentHashtagLink {
  link_id: number
  comment_id: number
  excerpt?: string | null
  video_id?: number | null
  video_title?: string | null
}

export class HashtagService {
  async list(page = 1, perPage = 15, params?: { search?: string; blocked?: boolean }): Promise<Paginated<HashtagRecord> & { meta?: { label_column?: string } }> {
    return apiClient.get('/admin/hashtags', { params: { page, per_page: perPage, ...params } })
  }

  async get(id: number): Promise<{ status: string; data: HashtagRecord; meta?: Record<string, unknown> }> {
    return apiClient.get(`/admin/hashtags/${id}`)
  }

  async create(label: string): Promise<{ status: string; data: HashtagRecord; message?: string }> {
    return apiClient.post('/admin/hashtags', { label })
  }

  async update(id: number, body: { label?: string; is_blocked?: boolean; block_reason?: string | null }): Promise<{ status: string; data: HashtagRecord }> {
    return apiClient.put(`/admin/hashtags/${id}`, body)
  }

  async remove(id: number): Promise<{ status: string; message?: string }> {
    return apiClient.delete(`/admin/hashtags/${id}`)
  }

  async merge(intoId: number, fromIds: number[]): Promise<{ status: string; data: HashtagRecord }> {
    return apiClient.post('/admin/hashtags/merge', { into_id: intoId, from_ids: fromIds })
  }

  async trends(params?: {
    region?: string
    date_from?: string
    date_to?: string
    hashtag_id?: number
    limit?: number
  }): Promise<{ status: string; data: HashtagTrendsData; meta?: { table_missing?: boolean } }> {
    return apiClient.get('/admin/hashtags/trends', { params })
  }

  async videoAssociations(
    hashtagId: number,
    page = 1,
    perPage = 15
  ): Promise<Paginated<VideoHashtagLink> & { meta?: { table_missing?: boolean } }> {
    return apiClient.get('/admin/hashtags/associations/videos', {
      params: { hashtag_id: hashtagId, page, per_page: perPage }
    })
  }

  async commentAssociations(
    hashtagId: number,
    page = 1,
    perPage = 15
  ): Promise<Paginated<CommentHashtagLink> & { meta?: { table_missing?: boolean } }> {
    return apiClient.get('/admin/hashtags/associations/comments', {
      params: { hashtag_id: hashtagId, page, per_page: perPage }
    })
  }
}

export const hashtagService = new HashtagService()
