import { apiClient } from './api/client'

export type WalletStatus = 'ACTIVE' | 'FROZEN' | 'SUSPENDED'

export interface Wallet {
  id: number
  user_id: number
  balance: string | number
  pending_balance: string | number
  total_earned: string | number
  status: WalletStatus
  frozen_reason?: string | null
  frozen_at?: string | null
  daily_limit?: string | number | null
  monthly_limit?: string | number | null
  user?: { id: number; username: string; display_name?: string | null }
}

export interface Pagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface WalletListResponse {
  status: string
  data: Wallet[]
  pagination: Pagination
}

export interface WalletDetailResponse {
  status: string
  data: {
    wallet: Wallet
    meta: {
      transactions_count: number
      locks_count: number
    }
  }
}

export type WalletTxType =
  | 'TOPUP'
  | 'WITHDRAWAL'
  | 'TRANSFER'
  | 'GIFT'
  | 'TIP'
  | 'REWARD'
  | 'PURCHASE'
  | 'REFUND'

export type WalletTxStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'

export interface WalletTransaction {
  id: number
  user_id: number
  wallet_id: number
  type: WalletTxType
  amount: string | number
  fee?: string | number | null
  net_amount?: string | number | null
  currency?: string | null
  status: WalletTxStatus
  provider_transaction_id?: string | null
  reference_id?: string | null
  error_message?: string | null
  initiated_at?: string | null
  completed_at?: string | null
  created_at?: string | null
  user?: { id: number; username: string; display_name?: string | null }
  wallet?: { id: number; user_id: number; status: WalletStatus; balance?: string | number }
}

export interface WalletTransactionListResponse {
  status: string
  data: WalletTransaction[]
  pagination: Pagination
}

export type WalletLockReason =
  | 'PENDING_WITHDRAWAL'
  | 'DISPUTE'
  | 'KYC_PENDING'
  | 'FRAUD_CHECK'
  | 'ADMIN_LOCK'
  | 'CHARGEBACK'
  | 'MAINTENANCE'

export interface WalletLock {
  id: number
  user_id: number
  wallet_id: number
  locked_by_admin_id?: number | null
  locked_amount: string | number
  reason: WalletLockReason
  description?: string | null
  locked_until?: string | null
  metadata?: Record<string, unknown> | null
  created_at?: string | null
  user?: { id: number; username: string; display_name?: string | null }
  wallet?: { id: number; user_id: number; status: WalletStatus; balance?: string | number }
}

export interface WalletLocksListResponse {
  status: string
  data: WalletLock[]
  pagination: Pagination
}

export type AuditAction =
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_RETRIED'
  | 'WITHDRAWAL_REQUESTED'
  | 'WITHDRAWAL_APPROVED'
  | 'WITHDRAWAL_FAILED'
  | 'WITHDRAWAL_CANCELLED'
  | 'TRANSFER_INITIATED'
  | 'TRANSFER_SUCCESS'
  | 'TRANSFER_FAILED'
  | 'KYC_TRIGGERED'
  | 'KYC_VERIFIED'
  | 'FRAUD_CHECK_TRIGGERED'
  | 'WALLET_LOCKED'
  | 'WALLET_UNLOCKED'
  | 'DISPUTE_FILED'
  | 'REFUND_INITIATED'
  | 'REFUND_SUCCESS'
  | 'LIMIT_EXCEEDED'
  | 'PROVIDER_ERROR'
  | 'WEBHOOK_RECEIVED'
  | 'WEBHOOK_PROCESSED'

export type AuditStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'WARNING'

export interface WalletAuditLog {
  id: number
  user_id?: number | null
  action: AuditAction
  amount?: string | number | null
  currency?: string | null
  provider?: string | null
  payment_method_type?: string | null
  status: AuditStatus
  ip_address?: string | null
  device_id?: string | null
  user_agent?: string | null
  metadata?: Record<string, unknown> | null
  created_at?: string | null
  user?: { id: number; username: string; display_name?: string | null }
}

export interface WalletAuditListResponse {
  status: string
  data: WalletAuditLog[]
  pagination: Pagination
}

/** Réponse GET /admin/wallets/overview — mini-dashboard page wallets */
export interface WalletOverviewTotals {
  wallets: number
  active: number
  frozen: number
  suspended: number
  locks: number
  balance_sum: number
}

export interface WalletOverviewTrends7d {
  labels: string[]
  wallets_created: number[]
  transactions: number[]
  revenue: number[]
  locks_created: number[]
}

export interface WalletOverviewData {
  totals: WalletOverviewTotals
  trends_7d: WalletOverviewTrends7d
}

export interface WalletOverviewResponse {
  status: string
  data: WalletOverviewData
}

export class WalletService {
  async overview(): Promise<WalletOverviewResponse> {
    return apiClient.get<WalletOverviewResponse>('/admin/wallets/overview')
  }

  async list(page = 1, perPage = 15, params?: { search?: string; status?: WalletStatus }): Promise<WalletListResponse> {
    return apiClient.get<WalletListResponse>('/admin/wallets', { params: { page, per_page: perPage, ...params } })
  }

  async get(id: number): Promise<WalletDetailResponse> {
    return apiClient.get<WalletDetailResponse>(`/admin/wallets/${id}`)
  }

  async freeze(id: number, reason: string): Promise<WalletDetailResponse> {
    return apiClient.patch<WalletDetailResponse>(`/admin/wallets/${id}/freeze`, { reason })
  }

  async unfreeze(id: number, reason: string): Promise<WalletDetailResponse> {
    return apiClient.patch<WalletDetailResponse>(`/admin/wallets/${id}/unfreeze`, { reason })
  }

  async listTransactions(
    page = 1,
    perPage = 15,
    params?: {
      user_id?: number
      wallet_id?: number
      status?: WalletTxStatus
      type?: WalletTxType
      reference_id?: string
      provider_transaction_id?: string
      date_from?: string
      date_to?: string
    }
  ): Promise<WalletTransactionListResponse> {
    return apiClient.get<WalletTransactionListResponse>('/admin/wallets/transactions', {
      params: { page, per_page: perPage, ...params }
    })
  }

  async listLocks(
    page = 1,
    perPage = 15,
    params?: {
      user_id?: number
      wallet_id?: number
      reason?: WalletLockReason
      locked_until_from?: string
      locked_until_to?: string
    }
  ): Promise<WalletLocksListResponse> {
    return apiClient.get<WalletLocksListResponse>('/admin/wallets/locks', {
      params: { page, per_page: perPage, ...params }
    })
  }

  async listAudit(
    page = 1,
    perPage = 15,
    params?: { user_id?: number; action?: AuditAction; status?: AuditStatus; date_from?: string; date_to?: string }
  ): Promise<WalletAuditListResponse> {
    return apiClient.get<WalletAuditListResponse>('/admin/wallets/audit', {
      params: { page, per_page: perPage, ...params }
    })
  }
}

export const walletService = new WalletService()

