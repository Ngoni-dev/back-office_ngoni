'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import StatusBadge from '@/components/StatusBadge'
import Divider from '@mui/material/Divider'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import { getLocalizedUrl } from '@/utils/i18n'
import { videoService, type Video } from '@/services/video.service'
import { toast } from 'react-toastify'

export default function VideoDetails() {
  const { id, lang } = useParams()
  const router = useRouter()
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await videoService.get(Number(id))
      setVideo(res.data)
    } catch {
      setVideo(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const moderate = async (moderation_status: 'approved' | 'rejected' | 'pending') => {
    try {
      await videoService.moderate(Number(id), { moderation_status })
      toast.success('Statut de modération mis à jour')
      fetchData()
    } catch {
      toast.error('Impossible de mettre à jour la modération')
    }
  }

  const updateFlags = async (payload: { is_sensitive?: boolean; is_copyright_violation?: boolean }) => {
    try {
      await videoService.updateFlags(Number(id), payload)
      toast.success('Flags mis à jour')
      fetchData()
    } catch {
      toast.error('Impossible de mettre à jour les flags')
    }
  }

  const removeVideo = async () => {
    const reason = window.prompt('Motif de suppression (obligatoire):', 'Contenu non conforme')
    if (!reason || !reason.trim()) return
    try {
      await videoService.delete(Number(id), reason.trim())
      toast.success('Vidéo supprimée')
      router.push(getLocalizedUrl('/apps/videos', lang as string))
    } catch {
      toast.error('Impossible de supprimer cette vidéo')
    }
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' py={8}>
        <CircularProgress />
      </Box>
    )
  }

  if (!video) return <Typography>Vidéo introuvable.</Typography>

  const isSensitive = (video as unknown as { is_sensitive?: boolean }).is_sensitive
  const isCopyrightViolation = (video as unknown as { is_copyright_violation?: boolean }).is_copyright_violation

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs
        items={[
          { label: 'Vidéos', href: getLocalizedUrl('/apps/videos', lang as string) },
          { label: `Vidéo #${video.id}` }
        ]}
      />
      <Card>
        <CardHeader
          title={video.title || `Vidéo #${video.id}`}
          subheader={video.user?.display_name ?? video.user?.username ?? `Utilisateur #${video.user_id}`}
          action={<Button variant='tonal' onClick={() => router.push(getLocalizedUrl('/apps/videos', lang as string))}>Retour</Button>}
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography><strong>Statut:</strong> {video.status ?? '—'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography><strong>Modération:</strong> {video.moderation_status ?? '—'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography>
                <strong>Signalée:</strong>{' '}
                <StatusBadge label={video.is_reported ? 'Oui' : 'Non'} tone={video.is_reported ? 'warning' : 'neutral'} />
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography><strong>Date:</strong> {video.created_at ? new Date(video.created_at).toLocaleString('fr-FR') : '—'}</Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography><strong>Description:</strong> {video.description || '—'}</Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography><strong>URL vidéo:</strong> {video.video_url ?? '—'}</Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography><strong>Thumbnail:</strong> {video.thumbnail_url ?? '—'}</Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant='contained' color='success' onClick={() => moderate('approved')}>Approuver</Button>
                <Button variant='contained' color='error' onClick={() => moderate('rejected')}>Rejeter</Button>
                <Button variant='outlined' onClick={() => moderate('pending')}>Remettre en attente</Button>
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant={isSensitive ? 'contained' : 'outlined'}
                  color='warning'
                  onClick={() => updateFlags({ is_sensitive: !isSensitive })}
                >
                  {isSensitive ? 'Retirer sensible' : 'Marquer sensible'}
                </Button>
                <Button
                  variant={isCopyrightViolation ? 'contained' : 'outlined'}
                  color='warning'
                  onClick={() => updateFlags({ is_copyright_violation: !isCopyrightViolation })}
                >
                  {isCopyrightViolation ? 'Retirer copyright' : 'Marquer copyright'}
                </Button>
                <Button variant='contained' color='error' onClick={removeVideo}>
                  Supprimer (soft)
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}
