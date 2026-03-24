/**
 * Dashboard types - ngoni_admin_api_dev
 */

export interface DashboardStats {
  users_count: number
  videos_count: number
  live_streams_count: number
  total_revenue: number
}

export interface DashboardTrends {
  labels: string[]
  users: number[]
  videos: number[]
  revenue: number[]
  period: string
}

export interface DashboardAlerts {
  pending_reports: number
  pending_kyc: number
  pending_certifications: number
  videos_to_moderate: number
}

export type DashboardPeriod = '7d' | '30d' | '90d'
