/**
 * useDashboard - fetch dashboard stats, trends, alerts
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { dashboardService } from '@/services/dashboard.service'
import type {
  DashboardStats,
  DashboardTrends,
  DashboardAlerts,
  DashboardPeriod,
  DashboardRecentTransaction
} from '@/types/dashboard.types'

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [trends, setTrends] = useState<DashboardTrends | null>(null)
  const [revenue24h, setRevenue24h] = useState<DashboardTrends | null>(null)
  const [alerts, setAlerts] = useState<DashboardAlerts | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<DashboardRecentTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastPeriodRef = useRef<DashboardPeriod>('7d')

  const fetchAll = useCallback(async (period: DashboardPeriod = '7d') => {
    lastPeriodRef.current = period
    setLoading(true)
    setError(null)
    try {
      const [statsRes, trendsRes, alertsRes, recentRes, revenue24hRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getTrends(period),
        dashboardService.getAlerts(),
        dashboardService.getRecentTransactions(5),
        dashboardService.getTrends('24h')
      ])
      setStats(statsRes)
      setTrends(trendsRes)
      setAlerts(alertsRes)
      setRecentTransactions((recentRes ?? []) as DashboardRecentTransaction[])
      setRevenue24h(revenue24hRes)
    } catch (err) {
      setError('Erreur réseau. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const refetch = (period?: DashboardPeriod) => fetchAll(period ?? '7d')

  // "Temps réel": refresh léger (stats + alertes + trends en dernier period)
  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const [statsRes, alertsRes, trendsRes, recentRes, revenue24hRes] = await Promise.all([
          dashboardService.getStats(true),
          dashboardService.getAlerts(true),
          dashboardService.getTrends(lastPeriodRef.current, true),
          dashboardService.getRecentTransactions(5, true),
          dashboardService.getTrends('24h', true)
        ])
        setStats(statsRes)
        setAlerts(alertsRes)
        setTrends(trendsRes)
        setRecentTransactions((recentRes ?? []) as DashboardRecentTransaction[])
        setRevenue24h(revenue24hRes)
      } catch {
        // silence: on garde les dernières valeurs
      }
    }, 15000)
    return () => clearInterval(t)
  }, [])

  return { stats, trends, revenue24h, alerts, recentTransactions, loading, error, refetch }
}
