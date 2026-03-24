/**
 * useDashboard - fetch dashboard stats, trends, alerts
 */

import { useState, useEffect, useCallback } from 'react'
import { dashboardService } from '@/services/dashboard.service'
import type {
  DashboardStats,
  DashboardTrends,
  DashboardAlerts,
  DashboardPeriod
} from '@/types/dashboard.types'

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [trends, setTrends] = useState<DashboardTrends | null>(null)
  const [alerts, setAlerts] = useState<DashboardAlerts | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async (period: DashboardPeriod = '7d') => {
    setLoading(true)
    setError(null)
    try {
      const [statsRes, trendsRes, alertsRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getTrends(period),
        dashboardService.getAlerts()
      ])
      setStats(statsRes)
      setTrends(trendsRes)
      setAlerts(alertsRes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur chargement dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const refetch = (period?: DashboardPeriod) => fetchAll(period ?? '7d')

  return { stats, trends, alerts, loading, error, refetch }
}
