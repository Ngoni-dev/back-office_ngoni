'use client'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import { useDashboard } from '@/hooks/useDashboard'
import DashboardStatsCards from '@/views/dashboard/DashboardStatsCards'
import DashboardTrendsChart from '@/views/dashboard/DashboardTrendsChart'
import DashboardAlertsWidget from '@/views/dashboard/DashboardAlertsWidget'
import DashboardRecentTransactions from '@/views/dashboard/DashboardRecentTransactions'
import DashboardRevenue24hCard from '@/views/dashboard/DashboardRevenue24hCard'
import type { DashboardPeriod } from '@/types/dashboard.types'
import { useParams, useRouter } from 'next/navigation'
import { getLocalizedUrl } from '@/utils/i18n'

export default function Dashboard() {
  const { lang } = useParams()
  const router = useRouter()
  const { stats, trends, revenue24h, alerts, recentTransactions, loading, error, refetch } = useDashboard()

  if (loading && !stats) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight={400}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box py={4}>
        <Typography color='error'>{error}</Typography>
      </Box>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <DashboardStatsCards
          usersCount={stats?.users_count ?? 0}
          videosCount={stats?.videos_count ?? 0}
          liveStreamsCount={stats?.live_streams_count ?? 0}
          walletsCount={stats?.wallets_count ?? 0}
          transactionsCount={stats?.transactions_count ?? 0}
          totalRevenue={stats?.total_revenue ?? 0}
          trends={trends}
        />
      </Grid>
      <Grid size={{ xs: 12, lg: 8 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <DashboardTrendsChart trends={trends} onPeriodChange={(p: DashboardPeriod) => refetch(p)} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <DashboardRecentTransactions
              items={recentTransactions}
              onShowAll={() => router.push(getLocalizedUrl('/apps/wallets/transactions', lang as string))}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <DashboardRevenue24hCard trends={revenue24h} />
          </Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <DashboardAlertsWidget alerts={alerts} />
      </Grid>
    </Grid>
  )
}
