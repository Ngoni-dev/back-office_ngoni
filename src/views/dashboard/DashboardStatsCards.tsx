'use client'

import Grid from '@mui/material/Grid'
import CardStatsSquare from '@/components/card-statistics/CardStatsSquare'

interface DashboardStatsCardsProps {
  usersCount: number
  videosCount: number
  liveStreamsCount: number
  totalRevenue: number
}

function formatRevenue(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M XOF`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k XOF`
  return `${Math.round(value)} XOF`
}

export default function DashboardStatsCards({
  usersCount,
  videosCount,
  liveStreamsCount,
  totalRevenue
}: DashboardStatsCardsProps) {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatsSquare
          stats={usersCount.toLocaleString()}
          statsTitle='Utilisateurs'
          avatarIcon='tabler-users'
          avatarColor='primary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatsSquare
          stats={videosCount.toLocaleString()}
          statsTitle='Vidéos'
          avatarIcon='tabler-video'
          avatarColor='success'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatsSquare
          stats={liveStreamsCount.toLocaleString()}
          statsTitle='Lives'
          avatarIcon='tabler-device-tv'
          avatarColor='info'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatsSquare
          stats={formatRevenue(totalRevenue)}
          statsTitle='Revenus'
          avatarIcon='tabler-currency-dollar'
          avatarColor='warning'
        />
      </Grid>
    </Grid>
  )
}
