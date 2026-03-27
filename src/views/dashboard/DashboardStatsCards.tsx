'use client'

import dynamic from 'next/dynamic'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import type { ApexOptions } from 'apexcharts'
import CustomAvatar from '@core/components/mui/Avatar'
import type { DashboardTrends } from '@/types/dashboard.types'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

interface DashboardStatsCardsProps {
  usersCount: number
  videosCount: number
  liveStreamsCount: number
  walletsCount: number
  transactionsCount: number
  totalRevenue: number
  trends: DashboardTrends | null
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
  walletsCount,
  transactionsCount,
  totalRevenue,
  trends
}: DashboardStatsCardsProps) {
  const theme = useTheme()
  const usersSeries = trends?.users ?? []
  const videosSeries = trends?.videos ?? []
  const livesSeries = trends?.lives ?? []
  const walletsSeries = trends?.wallets ?? []
  const txSeries = trends?.transactions ?? []
  const revenueSeries = trends?.revenue ?? []

  const sparkOptions = (color: string): ApexOptions => ({
    chart: { parentHeightOffset: 0, toolbar: { show: false }, sparkline: { enabled: true } },
    tooltip: { enabled: false },
    dataLabels: { enabled: false },
    stroke: { width: 2, curve: 'smooth' },
    fill: {
      type: 'gradient',
      gradient: {
        opacityTo: 0.05,
        opacityFrom: 0.45,
        shadeIntensity: 1,
        stops: [0, 100]
      }
    },
    colors: [color],
    xaxis: { labels: { show: false }, axisTicks: { show: false }, axisBorder: { show: false } },
    yaxis: { show: false },
    grid: { show: false, padding: { top: 6, bottom: 0, left: 0, right: 0 } }
  })

  const StatCard = ({
    title,
    value,
    icon,
    color,
    series
  }: {
    title: string
    value: string
    icon: string
    color: string
    series: number[]
  }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ pb: 1, minHeight: 76 }}>
        <div className='flex items-center justify-between gap-2'>
          <div className='flex flex-col gap-1'>
            <Typography
              variant='h5'
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.2
              }}
            >
              {value}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {title}
            </Typography>
          </div>
          <CustomAvatar variant='rounded' skin='light' size={34} sx={{ color, bgcolor: `${color}1A` }}>
            <i className={icon} />
          </CustomAvatar>
        </div>
      </CardContent>
      <AppReactApexCharts
        type='area'
        height={72}
        width='100%'
        options={sparkOptions(color)}
        series={[{ name: title, data: series }]}
      />
    </Card>
  )

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
        <StatCard
          value={usersCount.toLocaleString()}
          title='Utilisateurs'
          icon='tabler-users'
          color={theme.palette.primary.main}
          series={usersSeries}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
        <StatCard
          value={videosCount.toLocaleString()}
          title='Vidéos'
          icon='tabler-video'
          color={theme.palette.success.main}
          series={videosSeries}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
        <StatCard
          value={liveStreamsCount.toLocaleString()}
          title='Lives'
          icon='tabler-device-tv'
          color={theme.palette.info.main}
          series={livesSeries}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
        <StatCard
          value={walletsCount.toLocaleString()}
          title='Wallets'
          icon='tabler-wallet'
          color={theme.palette.secondary.main}
          series={walletsSeries}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
        <StatCard
          value={transactionsCount.toLocaleString()}
          title='Transactions'
          icon='tabler-receipt'
          color={theme.palette.error.main}
          series={txSeries}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
        <StatCard
          value={formatRevenue(totalRevenue)}
          title='Revenus'
          icon='tabler-currency-dollar'
          color={theme.palette.warning.main}
          series={revenueSeries}
        />
      </Grid>
    </Grid>
  )
}
