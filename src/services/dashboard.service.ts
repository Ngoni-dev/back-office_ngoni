/**
 * Dashboard service - ngoni_admin_api_dev
 */

import { apiClient } from './api/client'
import type { AxiosRequestConfig } from 'axios'
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
  private cfg(silent = false): AxiosRequestConfig | undefined {
    return silent ? ({ suppressErrorToast: true } as AxiosRequestConfig) : undefined
  }

  async getStats(silent = false): Promise<DashboardStats> {
    const res = await apiClient.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats', this.cfg(silent))
    return (res as ApiResponse<DashboardStats>).data
  }

  async getTrends(period: DashboardPeriod = '7d', silent = false): Promise<DashboardTrends> {
    const res = await apiClient.get<ApiResponse<DashboardTrends>>(
      `/admin/dashboard/trends?period=${period}`,
      this.cfg(silent)
    )
    return (res as ApiResponse<DashboardTrends>).data
  }

  async getAlerts(silent = false): Promise<DashboardAlerts> {
    const res = await apiClient.get<ApiResponse<DashboardAlerts>>('/admin/dashboard/alerts', this.cfg(silent))
    return (res as ApiResponse<DashboardAlerts>).data
  }

  async getRecentTransactions(limit = 5, silent = false) {
    const res = await apiClient.get<ApiResponse<any[]>>(`/admin/dashboard/recent-transactions?limit=${limit}`, this.cfg(silent))
    return (res as ApiResponse<any[]>).data
  }
}

export const dashboardService = new DashboardService()
