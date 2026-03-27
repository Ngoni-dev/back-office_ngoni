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
import type { UserOverviewData } from '@/services/user.service'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

function sumSeries(s: number[]): number {
  return s.reduce((a, b) => a + Number(b || 0), 0)
}

export default function UserOverviewCards({ data, loading }: { data: UserOverviewData | null; loading: boolean }) {
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
  const registrations7d = sumSeries(t.users_created)

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
        Vue d'ensemble
      </Typography>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title='Utilisateurs (total)'
            value={totals.users.toLocaleString('fr-FR')}
            icon='tabler-users'
            color={theme.palette.primary.main}
            series={t.users_created}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title='Nouveaux inscrits (7 j.)'
            value={registrations7d.toLocaleString('fr-FR')}
            icon='tabler-user-plus'
            color={theme.palette.success.main}
            series={t.users_created}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title='Créateurs (créés 7 j.)'
            value={sumSeries(t.creators_created).toLocaleString('fr-FR')}
            icon='tabler-star'
            color={theme.palette.warning.main}
            series={t.creators_created}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title='Entreprises (créées 7 j.)'
            value={sumSeries(t.business_created).toLocaleString('fr-FR')}
            icon='tabler-building-store'
            color={theme.palette.info.main}
            series={t.business_created}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 3, alignItems: 'center' }}>
        <Typography variant='caption' color='text.secondary' sx={{ mr: 0.5 }}>
          Statuts :
        </Typography>
        <Chip size='small' variant='outlined' color='success' label={`Actifs : ${totals.active.toLocaleString('fr-FR')}`} />
        <Chip size='small' variant='outlined' color='warning' label={`Suspendus : ${totals.suspended.toLocaleString('fr-FR')}`} />
        <Chip size='small' variant='outlined' color='error' label={`Bannis : ${totals.banned.toLocaleString('fr-FR')}`} />
        <Chip size='small' variant='outlined' label={`En attente : ${totals.pending_verification.toLocaleString('fr-FR')}`} />
        <Chip size='small' variant='outlined' label={`Archivés : ${totals.archived.toLocaleString('fr-FR')}`} />
      </Box>
    </Box>
  )
}
