'use client'

import { toast } from 'react-toastify'
// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// Service Imports
import { artistService } from '@/services/artist.service'
import { genreService } from '@/services/genre.service'
import { musicService } from '@/services/music.service'

// Type Imports
import type { Music, MusicArtist, MusicGenre, MusicStatus } from '@/types/music.types'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Component Imports
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import CustomTextField from '@core/components/mui/TextField'

const statusColors: Record<MusicStatus, 'default' | 'success' | 'error' | 'warning'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  blocked: 'default'
}

const statusLabels: Record<MusicStatus, string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Rejeté',
  blocked: 'Bloqué'
}

interface MusicDetailsProps {
  id: string
}

export default function MusicDetails({ id }: MusicDetailsProps) {
  const router = useRouter()
  const { lang } = useParams()

  const [music, setMusic] = useState<Music | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  const [title, setTitle] = useState('')
  const [language, setLanguage] = useState('')
  const [isOriginal, setIsOriginal] = useState(false)
  const [selectedArtists, setSelectedArtists] = useState<number[]>([])
  const [selectedGenres, setSelectedGenres] = useState<number[]>([])

  const [artists, setArtists] = useState<MusicArtist[]>([])
  const [genres, setGenres] = useState<MusicGenre[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const response = await musicService.get(Number(id))
        const data = response.data

        setMusic(data)
        setTitle(data.title)
        setLanguage(data.language || '')
        setIsOriginal(data.is_original || false)
        setSelectedArtists(data.artists?.map(a => a.id) || [])
        setSelectedGenres(data.genres?.map(g => g.id) || [])
      } catch {
        toast.error('Erreur lors du chargement de la musique')
        router.push(getLocalizedUrl('/apps/ngoni/music', lang as string))
      } finally {
        setLoading(false)
      }
    }

    fetchMusic()
  }, [id, router, lang])

  useEffect(() => {
    if (!editing) return

    const fetchData = async () => {
      try {
        const [artistsRes, genresRes] = await Promise.all([
          artistService.list(1, 100),
          genreService.list()
        ])

        setArtists(artistsRes.data ?? [])
        setGenres(genresRes.data ?? [])
      } catch {
        toast.error('Erreur lors du chargement des données')
      }
    }

    fetchData()
  }, [editing])

  const handleUpdate = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!title.trim()) {
      toast.error('Le titre est requis')
      return
    }

    setSubmitting(true)
    try {
      const response = await musicService.update(Number(id), {
        title: title.trim(),
        language: language || undefined,
        is_original: isOriginal,
        artist_ids: selectedArtists.length > 0 ? selectedArtists : undefined,
        genre_ids: selectedGenres.length > 0 ? selectedGenres : undefined
      })

      setMusic(response.data)
      setEditing(false)
      toast.success('Musique mise à jour avec succès')
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (newStatus: MusicStatus) => {
    try {
      const response = await musicService.updateStatus(Number(id), newStatus)
      setMusic(response.data)
      toast.success('Statut mis à jour avec succès')
    } catch {
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  const formatDuration = (seconds?: number, formatted?: string) => {
    if (formatted) return formatted
    if (seconds == null) return '—'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette musique ?')) return
    try {
      await musicService.delete(Number(id))
      toast.success('Musique supprimée avec succès')
      router.push(getLocalizedUrl('/apps/ngoni/music', lang as string))
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleCancel = () => {
    if (music) {
      setTitle(music.title)
      setLanguage(music.language || '')
      setIsOriginal(music.is_original || false)
      setSelectedArtists(music.artists?.map(a => a.id) || [])
      setSelectedGenres(music.genres?.map(g => g.id) || [])
    }
    setEditing(false)
  }

  const AudioPlayerCard = ({ url, label, icon }: { url: string; label: string; icon: string }) => (
    <Box
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: 'action.hover',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease',
        '&:hover': { borderColor: 'primary.main', boxShadow: 1 }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <i className={icon} style={{ fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant='subtitle1' fontWeight={600}>{label}</Typography>
          <Typography variant='caption' color='text.secondary'>Cliquez pour lire</Typography>
        </Box>
      </Box>
      <audio
        controls
        style={{
          width: '100%',
          height: 40,
          accentColor: 'var(--mui-palette-primary-main)'
        }}
      >
        <source src={url} type='audio/mpeg' />
        <source src={url} type='audio/mp3' />
        <source src={url} type='audio/wav' />
        Votre navigateur ne supporte pas la lecture audio.
      </audio>
    </Box>
  )

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  if (!music) {
    return <Alert severity='error'>Musique introuvable</Alert>
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs
        items={[
          { label: 'Musique', href: getLocalizedUrl('/apps/ngoni/music', lang as string) },
          { label: music.title }
        ]}
      />

      {/* Header avec actions (une seule ligne, pas de doublon) */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 5
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant='h4' fontWeight={600}>
            {music.title}
          </Typography>
          <Chip
            label={statusLabels[music.status]}
            color={statusColors[music.status]}
            variant='tonal'
            size='small'
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant='tonal'
            color='secondary'
            size='medium'
            startIcon={<i className='tabler-arrow-left' />}
            onClick={() => router.push(getLocalizedUrl('/apps/ngoni/music', lang as string))}
          >
            Liste
          </Button>
          {!editing ? (
            <>
              <Button
                variant='contained'
                size='medium'
                startIcon={<i className='tabler-edit' />}
                onClick={() => setEditing(true)}
              >
                Modifier
              </Button>
              <Button variant='tonal' color='error' size='medium' startIcon={<i className='tabler-trash' />} onClick={handleDelete}>
                Supprimer
              </Button>
            </>
          ) : (
            <>
              <Button variant='tonal' color='secondary' size='medium' onClick={handleCancel} disabled={submitting}>
                Annuler
              </Button>
              <Button
                variant='contained'
                size='medium'
                startIcon={submitting ? <CircularProgress size={18} color='inherit' /> : <i className='tabler-check' />}
                disabled={submitting || !title.trim()}
                onClick={() => handleUpdate()}
              >
                {submitting ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Grid container spacing={6} sx={{ width: '100%', minWidth: 0 }} alignItems='flex-start'>
        {/* Colonne principale */}
        <Grid size={{ xs: 12, md: 8 }} sx={{ minWidth: 0 }}>
          <Card sx={{ width: '100%' }}>
            <CardContent sx={{ p: 6 }}>
              {editing ? (
                <form onSubmit={handleUpdate}>
                  <Grid container spacing={4}>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant='subtitle1' fontWeight={600} color='text.secondary' sx={{ mb: 2 }}>
                        Informations
                      </Typography>
                      <Grid container spacing={4}>
                        <Grid size={{ xs: 12 }}><CustomTextField fullWidth label='Titre' value={title} onChange={e => setTitle(e.target.value)} required placeholder='Titre de la musique' /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><CustomTextField fullWidth label='Langue' value={language} onChange={e => setLanguage(e.target.value)} helperText='Code ISO 639-1 (ex: fr, en)' placeholder='fr' /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
                          <FormControlLabel control={<Checkbox checked={isOriginal} onChange={e => setIsOriginal(e.target.checked)} />} label='Composition originale' />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant='subtitle1' fontWeight={600} color='text.secondary' sx={{ mb: 2 }}>
                        Associations
                      </Typography>
                      <Grid container spacing={4}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <CustomTextField
                            select
                            fullWidth
                            label='Artistes'
                            value={selectedArtists}
                            onChange={e => { const v = e.target.value; setSelectedArtists(Array.isArray(v) ? v.map(x => Number(x)) : []) }}
                            SelectProps={{
                              multiple: true,
                              renderValue: (selected: unknown) => {
                                const ids = Array.isArray(selected) ? selected.map(Number) : []
                                if (ids.length === 0) return 'Aucun artiste'
                                if (ids.length <= 2) return ids.map(id => artists.find(a => a.id === id)?.name ?? id).filter(Boolean).join(', ')
                                return `${ids.length} artistes sélectionnés`
                              }
                            }}
                            helperText='Sélection multiple'
                          >
                            {artists.map(artist => <MenuItem key={artist.id} value={artist.id}>{artist.name}</MenuItem>)}
                          </CustomTextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <CustomTextField
                            select
                            fullWidth
                            label='Genres'
                            value={selectedGenres}
                            onChange={e => { const v = e.target.value; setSelectedGenres(Array.isArray(v) ? v.map(x => Number(x)) : []) }}
                            SelectProps={{
                              multiple: true,
                              renderValue: (selected: unknown) => {
                                const ids = Array.isArray(selected) ? selected.map(Number) : []
                                if (ids.length === 0) return 'Aucun genre'
                                if (ids.length <= 2) return ids.map(id => genres.find(g => g.id === id)?.name ?? id).filter(Boolean).join(', ')
                                return `${ids.length} genres sélectionnés`
                              }
                            }}
                            helperText='Sélection multiple'
                          >
                            {genres.map(genre => <MenuItem key={genre.id} value={genre.id}>{genre.name}</MenuItem>)}
                          </CustomTextField>
                        </Grid>
                      </Grid>
                    </Grid>
                    {(music.file_url || music.preview_url) && (
                      <Grid size={{ xs: 12 }}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant='subtitle1' fontWeight={600} color='text.secondary' sx={{ mb: 2 }}>
                          Écouter
                        </Typography>
                        <Grid container spacing={3}>
                          {music.file_url && <Grid size={{ xs: 12, md: music.preview_url ? 6 : 12 }}><AudioPlayerCard url={music.file_url} label='Original (fichier complet)' icon='tabler-music' /></Grid>}
                          {music.preview_url && <Grid size={{ xs: 12, md: music.file_url ? 6 : 12 }}><AudioPlayerCard url={music.preview_url} label='Aperçu (30s)' icon='tabler-player-play' /></Grid>}
                        </Grid>
                      </Grid>
                    )}
                  </Grid>
                </form>
              ) : (
                <>
                  {/* Informations générales */}
                  <Box sx={{ mb: 5 }}>
                    <Typography variant='subtitle1' fontWeight={600} color='text.secondary' sx={{ mb: 2 }}>
                      Informations générales
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>ID</Typography>
                        <Typography variant='body1' fontWeight={500}>{music.id}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>Durée</Typography>
                        <Typography variant='body1' fontWeight={500}>{formatDuration(music.duration, music.duration_formatted)}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>Langue</Typography>
                        <Typography variant='body1' fontWeight={500}>{music.language || '—'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>Type</Typography>
                        <Typography variant='body1' fontWeight={500}>{music.is_original ? 'Original' : 'Cover'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>Artistes</Typography>
                        <Box display='flex' gap={0.75} flexWrap='wrap'>
                          {music.artists?.length ? (
                            music.artists.map(artist => (
                              <Chip key={artist.id} label={artist.name} size='small' variant='outlined' />
                            ))
                          ) : (
                            <Typography variant='body1' color='text.secondary'>—</Typography>
                          )}
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>Genres</Typography>
                        <Box display='flex' gap={0.75} flexWrap='wrap'>
                          {music.genres?.length ? (
                            music.genres.map(genre => (
                              <Chip key={genre.id} label={genre.name} size='small' variant='outlined' />
                            ))
                          ) : (
                            <Typography variant='body1' color='text.secondary'>—</Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 4 }} />

                  {/* Lecteurs audio - Original et Preview */}
                  <Box sx={{ mb: 5 }}>
                    <Typography variant='subtitle1' fontWeight={600} color='text.secondary' sx={{ mb: 2 }}>
                      Écouter
                    </Typography>
                    {(music.file_url || music.preview_url) ? (
                      <Grid container spacing={3}>
                        {music.file_url && (
                          <Grid size={{ xs: 12, md: music.preview_url ? 6 : 12 }}>
                            <AudioPlayerCard url={music.file_url} label='Original (fichier complet)' icon='tabler-music' />
                          </Grid>
                        )}
                        {music.preview_url && (
                          <Grid size={{ xs: 12, md: music.file_url ? 6 : 12 }}>
                            <AudioPlayerCard url={music.preview_url} label='Aperçu (30s)' icon='tabler-player-play' />
                          </Grid>
                        )}
                      </Grid>
                    ) : (
                      <Box
                        sx={{
                          p: 5,
                          borderRadius: 2,
                          bgcolor: 'action.hover',
                          border: '1px dashed',
                          borderColor: 'divider',
                          textAlign: 'center'
                        }}
                      >
                        <i className='tabler-music-off' style={{ fontSize: 48, opacity: 0.5 }} />
                        <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                          Aucun fichier audio disponible
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ my: 4 }} />

                  {/* Historique */}
                  <Box>
                    <Typography variant='subtitle1' fontWeight={600} color='text.secondary' sx={{ mb: 2 }}>
                      Historique
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>Date de création</Typography>
                        <Typography variant='body1'>
                          {music.created_at ? new Date(music.created_at).toLocaleString('fr-FR') : '—'}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>Dernière modification</Typography>
                        <Typography variant='body1'>
                          {music.updated_at ? new Date(music.updated_at).toLocaleString('fr-FR') : '—'}
                        </Typography>
                      </Grid>
                      {music.approved_at && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant='caption' color='text.secondary' display='block' gutterBottom>Date d&apos;approbation</Typography>
                          <Typography variant='body1'>{new Date(music.approved_at).toLocaleString('fr-FR')}</Typography>
                        </Grid>
                      )}
                      {music.reviewer && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant='caption' color='text.secondary' display='block' gutterBottom>Révisé par</Typography>
                          <Typography variant='body1'>{music.reviewer.name}</Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar Statut */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ width: '100%', position: 'sticky', top: 100 }}>
            <CardHeader title='Statut' titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }} />
            <CardContent sx={{ pt: 0 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  border: '1px solid',
                  borderColor: 'divider',
                  mb: 3
                }}
              >
                <Typography variant='caption' color='text.secondary' display='block' gutterBottom>
                  Statut actuel
                </Typography>
                <Chip label={statusLabels[music.status]} color={statusColors[music.status]} variant='tonal' size='medium' />
              </Box>
              <Typography variant='caption' color='text.secondary' display='block' gutterBottom sx={{ mb: 1.5 }}>
                Changer le statut
              </Typography>
              <Box display='flex' flexDirection='column' gap={1.5}>
                <Button
                  variant='tonal'
                  color='success'
                  size='small'
                  fullWidth
                  startIcon={<i className='tabler-check' />}
                  onClick={() => handleStatusChange('approved')}
                  disabled={music.status === 'approved'}
                >
                  Approuver
                </Button>
                <Button
                  variant='tonal'
                  color='error'
                  size='small'
                  fullWidth
                  startIcon={<i className='tabler-x' />}
                  onClick={() => handleStatusChange('rejected')}
                  disabled={music.status === 'rejected'}
                >
                  Rejeter
                </Button>
                <Button
                  variant='tonal'
                  color='warning'
                  size='small'
                  fullWidth
                  startIcon={<i className='tabler-clock' />}
                  onClick={() => handleStatusChange('pending')}
                  disabled={music.status === 'pending'}
                >
                  En attente
                </Button>
                <Button
                  variant='tonal'
                  size='small'
                  fullWidth
                  startIcon={<i className='tabler-lock' />}
                  onClick={() => handleStatusChange('blocked')}
                  disabled={music.status === 'blocked'}
                >
                  Bloquer
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
