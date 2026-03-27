/**
 * Dashboard types - ngoni_admin_api_dev
 */

export interface DashboardStats {
  users_count: number
  videos_count: number
  live_streams_count: number
  wallets_count: number
  transactions_count: number
  total_revenue: number
}

export interface DashboardTrends {
  labels: string[]
  users: number[]
  videos: number[]
  lives?: number[]
  wallets?: number[]
  revenue: number[]
  transactions?: number[]
  period: string
}

export interface DashboardRecentTransaction {
  id: number
  created_at: string
  user_id: number
  wallet_id: number
  type: string
  amount: number | string | null
  net_amount: number | string | null
  currency: string | null
  status: string
  reference_id: string | null
  provider_transaction_id: string | null
  user?: { id: number; username?: string | null; display_name?: string | null } | null
}

export interface DashboardAlerts {
  pending_reports: number
  pending_kyc: number
  pending_certifications: number
  videos_to_moderate: number
}

export type DashboardPeriod = '24h' | '7d' | '30d' | '90d'
