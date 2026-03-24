/**
 * Dashboard service - ngoni_admin_api_dev
 */

import { apiClient } from './api/client'
import type {
  DashboardStats,
  DashboardTrends,
  DashboardAlerts,
  DashboardPeriod
} from '@/types/dashboard.types'

interface ApiResponse<T> {
  status: string
  data: T
}

export class DashboardService {
  async getStats(): Promise<DashboardStats> {
    const res = await apiClient.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats')
    return (res as ApiResponse<DashboardStats>).data
  }

  async getTrends(period: DashboardPeriod = '7d'): Promise<DashboardTrends> {
    const res = await apiClient.get<ApiResponse<DashboardTrends>>(
      `/admin/dashboard/trends?period=${period}`
    )
    return (res as ApiResponse<DashboardTrends>).data
  }

  async getAlerts(): Promise<DashboardAlerts> {
    const res = await apiClient.get<ApiResponse<DashboardAlerts>>('/admin/dashboard/alerts')
    return (res as ApiResponse<DashboardAlerts>).data
  }
}

export const dashboardService = new DashboardService()
