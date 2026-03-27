import { apiClient } from './api/client'

export interface KycDocument {
  id: number
  user_id: number
  document_type: string
  document_path: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  rejection_reason?: string | null
  verified_at?: string | null
  created_at: string
  user?: {
    id: number
    username: string
    display_name?: string | null
    phone_number?: string | null
    kyc_status?: string
  }
}

export interface KycListResponse {
  status: string
  data: KycDocument[]
  pagination: { current_page: number; per_page: number; total: number; last_page: number }
}

export class KycService {
  async list(page = 1, perPage = 15, params?: { search?: string; status?: string; document_type?: string }): Promise<KycListResponse> {
    return apiClient.get<KycListResponse>('/admin/kyc-documents', { params: { page, per_page: perPage, ...params } })
  }

  async get(id: number): Promise<{ status: string; data: KycDocument }> {
    return apiClient.get<{ status: string; data: KycDocument }>(`/admin/kyc-documents/${id}`)
  }

  async review(id: number, payload: { status: 'APPROVED' | 'REJECTED'; rejection_reason?: string }): Promise<{ status: string; data: KycDocument; message?: string }> {
    return apiClient.patch<{ status: string; data: KycDocument; message?: string }>(`/admin/kyc-documents/${id}/review`, payload)
  }
}

export const kycService = new KycService()
