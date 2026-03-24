'use client'

import dynamic from 'next/dynamic'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import type { ApexOptions } from 'apexcharts'
import { useState } from 'react'
import type { DashboardTrends } from '@/types/dashboard.types'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

interface DashboardTrendsChartProps {
  trends: DashboardTrends | null
  onPeriodChange: (period: '7d' | '30d' | '90d') => void
}

export default function DashboardTrendsChart({ trends, onPeriodChange }: DashboardTrendsChartProps) {
  const theme = useTheme()
  const [tab, setTab] = useState<'7d' | '30d' | '90d'>('7d')

  const handleTabChange = (_: React.SyntheticEvent, value: '7d' | '30d' | '90d') => {
    setTab(value)
    onPeriodChange(value)
  }

  const labels = trends?.labels ?? []
  const usersData = trends?.users ?? []
  const revenueData = trends?.revenue ?? []

  const series = [
    { name: 'Inscriptions', data: usersData },
    { name: 'Revenus (XOF)', data: revenueData }
  ]

  const options: ApexOptions = {
    chart: { toolbar: { show: false } },
    stroke: { width: 2, curve: 'smooth' },
    xaxis: {
      categories: labels.map(d => d.slice(5)),
      labels: { rotate: -45 }
    },
    yaxis: [
      { title: { text: 'Utilisateurs' } },
      { opposite: true, title: { text: 'Revenus' }, labels: { formatter: (v) => `${v}` } }
    ],
    colors: [theme.palette.primary.main, theme.palette.success.main],
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
            <Tab value='7d' label='7 jours' />
            <Tab value='30d' label='30 jours' />
            <Tab value='90d' label='90 jours' />
          </Tabs>
        }
      />
      <CardContent>
        {trends && (trends.users.length > 0 || trends.revenue.length > 0) ? (
          <AppReactApexCharts type='line' height={300} options={options} series={series} />
        ) : (
          <Typography color='text.secondary'>Aucune donnée sur cette période</Typography>
        )}
      </CardContent>
    </Card>
  )
}
