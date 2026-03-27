'use client'

import dynamic from 'next/dynamic'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import type { ApexOptions } from 'apexcharts'
import CustomAvatar from '@core/components/mui/Avatar'
import type { WalletOverviewData } from '@/services/wallet.service'
import { formatAmount } from './walletUi'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

function sumSeries(s: number[]): number {
  return s.reduce((a, b) => a + Number(b || 0), 0)
}

export default function WalletOverviewCards({
  data,
  loading
}: {
  data: WalletOverviewData | null
  loading: boolean
}) {
  const theme = useTheme()

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
    subValue,
    icon,
    color,
    series
  }: {
    title: string
    value: string
    subValue?: string
    icon: string
    color: string
    series: number[]
  }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ pb: 1, minHeight: 76 }}>
        <div className='flex items-center justify-between gap-2'>
          <div className='flex flex-col gap-0.5'>
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
            {subValue ? (
              <Typography variant='caption' color='text.disabled'>
                {subValue}
              </Typography>
            ) : null}
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

  if (loading) {
    return (
      <Grid container spacing={6} sx={{ mb: 2 }}>
        {[0, 1, 2, 3].map(i => (
          <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Skeleton variant='rounded' height={168} sx={{ borderRadius: 1 }} />
          </Grid>
        ))}
      </Grid>
    )
  }

  if (!data) return null

  const { totals, trends_7d: t } = data
  const txSum = sumSeries(t.transactions)
  const revenueSum = sumSeries(t.revenue)

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
        Vue d’ensemble
      </Typography>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title='Solde total (agrégé)'
            value={formatAmount(totals.balance_sum)}
            subValue='Tendance volume entrées (7 j.)'
            icon='tabler-coins'
            color={theme.palette.warning.main}
            series={t.revenue}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title='Portefeuilles'
            value={totals.wallets.toLocaleString('fr-FR')}
            icon='tabler-wallet'
            color={theme.palette.secondary.main}
            series={t.wallets_created}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title='Transactions (7 j.)'
            value={txSum.toLocaleString('fr-FR')}
            icon='tabler-receipt'
            color={theme.palette.error.main}
            series={t.transactions}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title='Verrous'
            value={totals.locks.toLocaleString('fr-FR')}
            subValue='Créations sur 7 j.'
            icon='tabler-lock'
            color={theme.palette.info.main}
            series={t.locks_created}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 3, alignItems: 'center' }}>
        <Typography variant='caption' color='text.secondary' sx={{ mr: 0.5 }}>
          Statuts :
        </Typography>
        <Chip size='small' variant='outlined' color='success' label={`Actifs : ${totals.active.toLocaleString('fr-FR')}`} />
        <Chip size='small' variant='outlined' color='warning' label={`Gelés : ${totals.frozen.toLocaleString('fr-FR')}`} />
        <Chip size='small' variant='outlined' color='error' label={`Suspendus : ${totals.suspended.toLocaleString('fr-FR')}`} />
        <Typography variant='caption' color='text.secondary' sx={{ ml: { xs: 0, sm: 2 } }}>
          Volume entrées (7 j.) :{' '}
          <strong>{Math.round(revenueSum).toLocaleString('fr-FR')} FCFA</strong>
        </Typography>
      </Box>
    </Box>
  )
}
