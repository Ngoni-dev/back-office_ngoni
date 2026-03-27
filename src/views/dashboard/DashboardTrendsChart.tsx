'use client'

import dynamic from 'next/dynamic'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import type { ApexOptions } from 'apexcharts'
import { useState } from 'react'
import type { DashboardTrends } from '@/types/dashboard.types'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

interface DashboardTrendsChartProps {
  trends: DashboardTrends | null
  onPeriodChange: (period: '24h' | '7d' | '30d' | '90d') => void
}

export default function DashboardTrendsChart({ trends, onPeriodChange }: DashboardTrendsChartProps) {
  useTheme()
  const [tab, setTab] = useState<'24h' | '7d' | '30d' | '90d'>('7d')

  const handleTabChange = (_: React.SyntheticEvent, value: '24h' | '7d' | '30d' | '90d') => {
    setTab(value)
    onPeriodChange(value)
  }

  const labels = trends?.labels ?? []
  const usersData = trends?.users ?? []
  const videosData = trends?.videos ?? []
  const livesData = trends?.lives ?? []
  const revenueData = trends?.revenue ?? []
  const transactionsData = trends?.transactions ?? []
  const hasActivity = [...usersData, ...videosData, ...revenueData, ...transactionsData, ...livesData].some(v => Number(v) > 0)

  const series = [
    { name: 'Inscriptions', data: usersData },
    { name: 'Vidéos', data: videosData },
    { name: 'Lives', data: livesData },
    { name: 'Transactions', data: transactionsData },
    { name: 'Revenus (XOF)', data: revenueData }
  ]

  const options: ApexOptions = {
    chart: { toolbar: { show: false }, animations: { enabled: true } },
    stroke: { width: 2, curve: 'smooth' },
    xaxis: {
      categories: tab === '24h' ? labels.map(d => d.slice(11)) : labels.map(d => d.slice(5)),
      labels: { rotate: -45 }
    },
    yaxis: [
      {
        title: { text: 'Volume' },
        labels: { formatter: v => `${Math.round(v)}` }
      },
      {
        opposite: true,
        title: { text: 'Revenus' },
        labels: { formatter: v => `${Math.round(v).toLocaleString('fr-FR')}` }
      }
    ],
    tooltip: {
      shared: true,
      y: {
        formatter: (value, { seriesIndex }) => {
          // Revenus est la dernière série
          if (seriesIndex === series.length - 1) return `${Math.round(value).toLocaleString('fr-FR')} XOF`
          return `${Math.round(value)}`
        }
      }
    },
    colors: ['#3B82F6', '#F59E0B', '#06B6D4', '#A855F7', '#22C55E'],
    legend: { position: 'top' },
    dataLabels: { enabled: false }
  }

  return (
    <Card>
      <CardHeader
        title='Tendances'
        subheader='Inscriptions et revenus'
        action={
          <Tabs value={tab} onChange={handleTabChange}>
            <Tab value='24h' label='24h' />
            <Tab value='7d' label='7 jours' />
            <Tab value='30d' label='30 jours' />
            <Tab value='90d' label='90 jours' />
          </Tabs>
        }
      />
      <CardContent>
        {trends && labels.length > 0 ? (
          <Box>
            <AppReactApexCharts type='line' height={300} options={options} series={series} />
            {!hasActivity && (
              <Typography color='text.secondary' variant='body2' sx={{ mt: 2 }}>
                Aucune activité détectée sur cette période. Essayez 30 ou 90 jours.
              </Typography>
            )}
          </Box>
        ) : (
          <Typography color='text.secondary'>Aucune donnée sur cette période</Typography>
        )}
      </CardContent>
    </Card>
  )
}
