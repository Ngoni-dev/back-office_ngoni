'use client'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import { useDashboard } from '@/hooks/useDashboard'
import DashboardStatsCards from '@/views/dashboard/DashboardStatsCards'
import DashboardTrendsChart from '@/views/dashboard/DashboardTrendsChart'
import DashboardAlertsWidget from '@/views/dashboard/DashboardAlertsWidget'
import type { DashboardPeriod } from '@/types/dashboard.types'

export default function Dashboard() {
  const { stats, trends, alerts, loading, error, refetch } = useDashboard()

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
          totalRevenue={stats?.total_revenue ?? 0}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <DashboardTrendsChart
          trends={trends}
          onPeriodChange={(p: DashboardPeriod) => refetch(p)}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <DashboardAlertsWidget alerts={alerts} />
      </Grid>
    </Grid>
  )
}
