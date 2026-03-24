'use client'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import type { DashboardAlerts } from '@/types/dashboard.types'

interface DashboardAlertsWidgetProps {
  alerts: DashboardAlerts | null
}

const items: { key: keyof DashboardAlerts; label: string; icon: string; href: string }[] = [
  { key: 'pending_reports', label: 'Signalements', icon: 'tabler-flag', href: '#' },
  { key: 'pending_kyc', label: 'KYC en attente', icon: 'tabler-id', href: '#' },
  { key: 'pending_certifications', label: 'Certifications', icon: 'tabler-badge-check', href: '#' },
  { key: 'videos_to_moderate', label: 'Vidéos à modérer', icon: 'tabler-video-plus', href: '#' }
]

export default function DashboardAlertsWidget({ alerts }: DashboardAlertsWidgetProps) {
  if (!alerts) return null

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          Alertes modération
        </Typography>
        <Grid container spacing={3}>
          {items.map(({ key, label, icon, href }) => {
            const count = alerts[key] ?? 0
            return (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={key}>
                <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Card variant='outlined' sx={{ p: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                    <Typography variant='h4' color={count > 0 ? 'warning.main' : 'text.secondary'}>
                      {count}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {label}
                    </Typography>
                    <i className={`${icon} text-[24px] mt-1 block`} />
                  </Card>
                </Link>
              </Grid>
            )
          })}
        </Grid>
      </CardContent>
    </Card>
  )
}
