'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import type { ApexOptions } from 'apexcharts'
import CustomAvatar from '@core/components/mui/Avatar'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import { getLocalizedUrl } from '@/utils/i18n'
import { musicService } from '@/services/music.service'
import { giftProductService } from '@/services/gift.service'
import type { MusicOverviewResponse } from '@/types/music.types'
import type { GiftProductOverviewResponse } from '@/types/gift.types'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

type StatCardProps = {
  title: string
  value: string
  icon: string
  color: string
  series: number[]
}

function StatCard({ title, value, icon, color, series }: StatCardProps) {
  const sparkOptions = (lineColor: string): ApexOptions => ({
    chart: { parentHeightOffset: 0, toolbar: { show: false }, sparkline: { enabled: true } },
    tooltip: { enabled: false },
    dataLabels: { enabled: false },
    stroke: { width: 2, curve: 'smooth' },
    fill: { type: 'gradient', gradient: { opacityTo: 0.05, opacityFrom: 0.45, shadeIntensity: 1, stops: [0, 100] } },
    colors: [lineColor],
    xaxis: { labels: { show: false }, axisTicks: { show: false }, axisBorder: { show: false } },
    yaxis: { show: false },
    grid: { show: false, padding: { top: 6, bottom: 0, left: 0, right: 0 } }
  })

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ pb: 1, minHeight: 76 }}>
        <div className='flex items-center justify-between gap-2'>
          <div className='flex flex-col gap-0.5'>
            <Typography variant='h5' sx={{ lineHeight: 1.2 }}>
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
}

export default function NgoniContentDashboard() {
  const router = useRouter()
  const { lang } = useParams()
  const theme = useTheme()

  const [loading, setLoading] = useState(true)
  const [musicOverview, setMusicOverview] = useState<MusicOverviewResponse['data'] | null>(null)
  const [giftOverview, setGiftOverview] = useState<GiftProductOverviewResponse['data'] | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void (async () => {
      try {
        const [musicRes, giftRes] = await Promise.all([musicService.overview(), giftProductService.overview()])
        if (!cancelled) {
          setMusicOverview(musicRes.data ?? null)
          setGiftOverview(giftRes.data ?? null)
        }
      } catch {
        if (!cancelled) {
          setMusicOverview(null)
          setGiftOverview(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs items={[{ label: 'Ngoni Content' }, { label: 'Dashboard' }]} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Typography variant='h5'>Dashboard Ngoni Content</Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant='outlined' onClick={() => router.push(getLocalizedUrl('/apps/ngoni/music', lang as string))}>
            Musiques
          </Button>
          <Button variant='outlined' onClick={() => router.push(getLocalizedUrl('/apps/ngoni/gift-products', lang as string))}>
            Gift Products
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Grid container spacing={6}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
            <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Skeleton variant='rounded' height={168} />
            </Grid>
          ))}
        </Grid>
      ) : !musicOverview || !giftOverview ? (
        <Box display='flex' justifyContent='center' alignItems='center' minHeight={220}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant='h6' sx={{ mb: 2 }}>
            Musiques (tous les éléments)
          </Typography>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                title='Musiques'
                value={musicOverview.totals.musics.toLocaleString('fr-FR')}
                icon='tabler-music'
                color={theme.palette.primary.main}
                series={musicOverview.trends_7d.musics_created}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                title='Artistes'
                value={musicOverview.totals.artists.toLocaleString('fr-FR')}
                icon='tabler-user-star'
                color={theme.palette.success.main}
                series={musicOverview.trends_7d.artists_created}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                title='Genres'
                value={musicOverview.totals.genres.toLocaleString('fr-FR')}
                icon='tabler-category'
                color={theme.palette.info.main}
                series={musicOverview.trends_7d.genres_created}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                title='Licences'
                value={musicOverview.totals.licenses.toLocaleString('fr-FR')}
                icon='tabler-license'
                color={theme.palette.warning.main}
                series={musicOverview.trends_7d.licenses_created}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2 }}>
            <Chip size='small' variant='outlined' color='warning' label={`En attente: ${musicOverview.totals.pending}`} />
            <Chip size='small' variant='outlined' color='success' label={`Approuvées: ${musicOverview.totals.approved}`} />
            <Chip size='small' variant='outlined' color='error' label={`Rejetées: ${musicOverview.totals.rejected}`} />
            <Chip size='small' variant='outlined' label={`Bloquées: ${musicOverview.totals.blocked}`} />
            <Chip size='small' variant='outlined' label={`Originales: ${musicOverview.totals.original}`} />
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant='h6' sx={{ mb: 2 }}>
            Gift Products
          </Typography>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                title='Produits'
                value={giftOverview.totals.products.toLocaleString('fr-FR')}
                icon='tabler-gift'
                color={theme.palette.primary.main}
                series={giftOverview.trends_7d.products_created}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                title='Actifs'
                value={giftOverview.totals.active.toLocaleString('fr-FR')}
                icon='tabler-check'
                color={theme.palette.success.main}
                series={giftOverview.trends_7d.active_created}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                title='Total envoyés'
                value={giftOverview.totals.total_sent.toLocaleString('fr-FR')}
                icon='tabler-send'
                color={theme.palette.info.main}
                series={giftOverview.trends_7d.products_created}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                title='Revenus cadeaux'
                value={`${Math.round(Number(giftOverview.totals.total_revenue || 0)).toLocaleString('fr-FR')} FCFA`}
                icon='tabler-coins'
                color={theme.palette.warning.main}
                series={giftOverview.trends_7d.products_created}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2 }}>
            <Chip size='small' variant='outlined' color='success' label={`Actifs: ${giftOverview.totals.active}`} />
            <Chip size='small' variant='outlined' color='warning' label={`Inactifs: ${giftOverview.totals.inactive}`} />
            <Chip size='small' variant='outlined' label={`Archivés: ${giftOverview.totals.archived}`} />
          </Box>
        </>
      )}
    </Box>
  )
}
