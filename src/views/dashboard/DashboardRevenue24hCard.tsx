'use client'

import dynamic from 'next/dynamic'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import type { ApexOptions } from 'apexcharts'
import type { DashboardTrends } from '@/types/dashboard.types'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

export default function DashboardRevenue24hCard({ trends }: { trends: DashboardTrends | null }) {
  const labels = trends?.labels ?? []
  const revenue = trends?.revenue ?? []

  const total = revenue.reduce((a, b) => a + Number(b || 0), 0)

  const options: ApexOptions = {
    chart: { parentHeightOffset: 0, toolbar: { show: false }, sparkline: { enabled: true } },
    stroke: { width: 2, curve: 'smooth' },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 0.3, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 90, 100] }
    },
    colors: ['var(--mui-palette-success-main)'],
    tooltip: {
      x: { show: true },
      y: { formatter: v => `${Math.round(Number(v)).toLocaleString('fr-FR')} XOF` }
    },
    xaxis: { categories: labels.map(l => l.slice(11)) }
  }

  return (
    <Card>
      <CardHeader title='Revenus (24h)' subheader='Total sur les dernières 24h' />
      <CardContent>
        <Typography variant='h5' sx={{ mb: 2 }}>
          {Math.round(total).toLocaleString('fr-FR')} XOF
        </Typography>
        <AppReactApexCharts type='area' height={140} width='100%' options={options} series={[{ name: 'Revenus', data: revenue }]} />
      </CardContent>
    </Card>
  )
}

