'use client'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import StatusBadge from '@/components/StatusBadge'
import Box from '@mui/material/Box'
import type { DashboardAlerts } from '@/types/dashboard.types'

interface DashboardAlertsWidgetProps {
  alerts: DashboardAlerts | null
}

const items: { key: keyof DashboardAlerts; label: string; icon: string; helper: string }[] = [
  { key: 'pending_reports', label: 'Signalements', icon: 'tabler-flag', helper: 'A traiter en priorité' },
  { key: 'pending_kyc', label: 'KYC en attente', icon: 'tabler-id', helper: 'Validation des identités' },
  { key: 'pending_certifications', label: 'Certifications', icon: 'tabler-badge-check', helper: 'Demandes de badge certifié' },
  { key: 'videos_to_moderate', label: 'Vidéos à modérer', icon: 'tabler-video-plus', helper: 'Contenu en attente de revue' }
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
          {items.map(({ key, label, icon, helper }) => {
            const count = alerts[key] ?? 0
            const hasAlert = count > 0
            return (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={key}>
                <Card
                  variant='outlined'
                  sx={{
                    p: 2,
                    height: '100%',
                    borderColor: hasAlert ? 'warning.main' : 'divider',
                    backgroundColor: hasAlert ? 'warning.light' : 'background.paper'
                  }}
                >
                  <Box display='flex' alignItems='center' justifyContent='space-between' mb={1}>
                    <Typography variant='h4' color={hasAlert ? 'warning.dark' : 'text.primary'}>
                      {count}
                    </Typography>
                    <i className={`${icon} text-[22px]`} />
                  </Box>
                  <Typography variant='subtitle2'>{label}</Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5, mb: 1.5 }}>
                    {helper}
                  </Typography>
                  <StatusBadge label={hasAlert ? 'Action requise' : 'RAS'} tone={hasAlert ? 'warning' : 'neutral'} />
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </CardContent>
    </Card>
  )
}
