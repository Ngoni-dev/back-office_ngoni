import { apiClient } from './api/client'

export interface Certification {
  id: number
  user_id: number
  status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  full_name: string
  phone_number: string
  submitted_at?: string | null
  reviewed_at?: string | null
  rejection_reason?: string | null
  admin_notes?: string | null
  has_certified_badge?: boolean
  user?: {
    id: number
    username: string
    display_name?: string | null
    phone_number?: string | null
    is_certified?: boolean
    certified_at?: string | null
  }
}

export interface CertificationListResponse {
  status: string
  data: Certification[]
  pagination: { current_page: number; per_page: number; total: number; last_page: number }
}

export class CertificationService {
  async list(page = 1, perPage = 15, params?: { search?: string; status?: string }): Promise<CertificationListResponse> {
    return apiClient.get<CertificationListResponse>('/admin/certifications', { params: { page, per_page: perPage, ...params } })
  }

  async get(id: number): Promise<{ status: string; data: Certification }> {
    return apiClient.get<{ status: string; data: Certification }>(`/admin/certifications/${id}`)
  }

  async review(
    id: number,
    payload: { status: 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'; admin_notes?: string; rejection_reason?: string }
  ): Promise<{ status: string; data: Certification; message?: string }> {
    return apiClient.patch<{ status: string; data: Certification; message?: string }>(`/admin/certifications/${id}/review`, payload)
  }

  async toggleBadge(id: number, hasCertifiedBadge: boolean): Promise<{ status: string; data: Certification; message?: string }> {
    return apiClient.patch<{ status: string; data: Certification; message?: string }>(`/admin/certifications/${id}/badge`, {
      has_certified_badge: hasCertifiedBadge
    })
  }
}

export const certificationService = new CertificationService()
