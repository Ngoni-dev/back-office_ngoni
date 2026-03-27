import { apiClient } from './api/client'

export interface VideoComment {
  id: number
  video_id: number
  user_id: number
  parent_id?: number | null
  body: string
  is_hidden: boolean
  created_at?: string
  video?: { id: number; title: string }
  user?: { id: number; username: string; display_name?: string | null }
}

export interface CommentListResponse {
  status: string
  data: VideoComment[]
  pagination: { current_page: number; per_page: number; total: number; last_page: number }
}

export class CommentService {
  async list(
    page = 1,
    perPage = 15,
    params?: { search?: string; video_id?: number; user_id?: number; is_hidden?: boolean }
  ): Promise<CommentListResponse> {
    return apiClient.get<CommentListResponse>('/admin/comments', { params: { page, per_page: perPage, ...params } })
  }

  async get(id: number): Promise<{ status: string; data: VideoComment }> {
    return apiClient.get<{ status: string; data: VideoComment }>(`/admin/comments/${id}`)
  }

  async moderate(id: number, action: 'approve' | 'hide' | 'delete'): Promise<{ status: string; message?: string }> {
    return apiClient.patch<{ status: string; message?: string }>(`/admin/comments/${id}/moderate`, { action })
  }

  async bulkModerate(ids: number[], action: 'approve' | 'hide' | 'delete'): Promise<{ status: string; message?: string; data?: { affected: number } }> {
    return apiClient.patch<{ status: string; message?: string; data?: { affected: number } }>('/admin/comments/bulk-moderate', {
      ids,
      action
    })
  }
}

export const commentService = new CommentService()
