'use client'

// React Imports
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

const Dashboard = () => {
  const params = useParams()
  const locale = (params?.lang as string) || 'en'

  const messages: Record<string, { title: string; subtitle: string }> = {
    fr: { title: 'À venir', subtitle: 'Sera effectué quand le projet va évoluer pour une meilleure disposition des données.' },
    en: { title: 'Coming Soon', subtitle: 'This section will be available soon when the project evolves for better data disposition.' },
    ar: { title: 'قريبا', subtitle: 'ستكون هذه القسم متاحة قريبًا.' }
  }

  const { title, subtitle } = messages[locale] || messages.en

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card sx={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <img
              alt='coming-soon-illustration'
              src='/images/illustrations/characters/2.png'
              style={{ maxHeight: 280, objectFit: 'contain', marginBottom: 24 }}
            />
            <Typography variant='h3' gutterBottom color='text.primary'>
              {title}
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              {subtitle}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default Dashboard
