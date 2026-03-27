import { apiClient } from './api/client'

export interface Story {
  id: number
  user_id: number
  media_url: string
  media_type: 'image' | 'video'
  caption?: string | null
  visibility: 'public' | 'friends' | 'private'
  allow_replies: boolean
  views_count: number
  expires_at: string
  created_at?: string
  user?: { id: number; username: string; display_name?: string | null }
}

export interface StoryListResponse {
  status: string
  data: Story[]
  pagination: { current_page: number; per_page: number; total: number; last_page: number }
}

export interface StoryStats {
  total: number
  active: number
  expired: number
  views_total: number
  replies_total: number
  avg_views_per_story: number
  avg_replies_per_story: number
}

export class StoryService {
  async list(page = 1, perPage = 15, params?: { search?: string; media_type?: string; state?: string; visibility?: string }): Promise<StoryListResponse> {
    return apiClient.get<StoryListResponse>('/admin/stories', { params: { page, per_page: perPage, ...params } })
  }

  async get(id: number): Promise<{ status: string; data: { story: Story; replies: any[] } }> {
    return apiClient.get<{ status: string; data: { story: Story; replies: any[] } }>(`/admin/stories/${id}`)
  }

  async stats(): Promise<{ status: string; data: StoryStats }> {
    return apiClient.get<{ status: string; data: StoryStats }>('/admin/stories/stats')
  }

  async moderate(id: number, reason: string): Promise<{ status: string; message?: string }> {
    return apiClient.patch<{ status: string; message?: string }>(`/admin/stories/${id}/moderate`, {
      action: 'delete',
      reason
    })
  }
}

export const storyService = new StoryService()
