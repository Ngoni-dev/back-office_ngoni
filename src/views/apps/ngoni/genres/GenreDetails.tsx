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
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// Service Imports
import { genreService } from '@/services/genre.service'
import { musicService } from '@/services/music.service'

// Type Imports
import type { Genre } from '@/types/genre.types'
import type { Music } from '@/types/music.types'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Component Imports
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import CustomTextField from '@core/components/mui/TextField'

type GenreMusicItem = { id: number; title: string }

interface GenreDetailsProps {
  id: string
}

export default function GenreDetails({ id }: GenreDetailsProps) {
  const router = useRouter()
  const { lang } = useParams()

  const [genre, setGenre] = useState<Genre | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [musics, setMusics] = useState<GenreMusicItem[]>([])
  const [allMusicsForAttach, setAllMusicsForAttach] = useState<Music[]>([])
  const [selectedMusicIdForAttach, setSelectedMusicIdForAttach] = useState<number | ''>('')
  const [attaching, setAttaching] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchGenre = async () => {
    try {
      const response = await genreService.get(Number(id))
      const data = response?.data ?? response
      if (!data) throw new Error('Invalid response')

      setGenre(data)
      setName(data.name)
      setDescription(data.description ?? '')
      const rawMusics = data.musics ?? []
      setMusics(
        Array.isArray(rawMusics)
          ? rawMusics.map((m: { id: number; title: string }) => ({ id: m.id, title: m.title }))
          : []
      )
    } catch {
      toast.error('Erreur lors du chargement du genre')
      router.push(getLocalizedUrl('/apps/ngoni/genres', lang as string))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGenre()
  }, [id, router, lang])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await musicService.list(1, 200, { skip404Toast: true })
        setAllMusicsForAttach(res.data ?? [])
      } catch {
        setAllMusicsForAttach([])
      }
    }
    if (genre) load()
  }, [genre])

  const refetchGenreAndMusics = async () => {
    try {
      const res = await genreService.get(Number(id))
      const data = res?.data ?? res
      if (!data) return
      setGenre(data)
      const rawMusics = data.musics ?? []
      setMusics(
        Array.isArray(rawMusics)
          ? rawMusics.map((m: { id: number; title: string }) => ({ id: m.id, title: m.title }))
          : []
      )
    } catch {
      // ignore
    }
  }

  const handleUpdate = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!name.trim()) {
      toast.error('Le nom est requis')
      return
    }
    setSubmitting(true)
    try {
      const updated = await genreService.update(Number(id), {
        name: name.trim(),
        description: description.trim() || undefined
      })
      setGenre(updated.data)
      setEditing(false)
      toast.success('Genre mis à jour')
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (genre) {
      setName(genre.name)
      setDescription(genre.description ?? '')
    }
    setEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce genre ?')) return
    try {
      await genreService.delete(Number(id))
      toast.success('Genre supprimé')
      router.push(getLocalizedUrl('/apps/ngoni/genres', lang as string))
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleDetachMusic = async (musicId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir détacher cette musique ?')) return
    try {
      await genreService.detachFromMusic(musicId, Number(id))
      toast.success('Musique détachée')
      await refetchGenreAndMusics()
    } catch {
      toast.error('Erreur lors du détachement')
    }
  }

  const handleAttachMusic = async () => {
    if (!selectedMusicIdForAttach) {
      toast.error('Sélectionnez une musique')
      return
    }
    setAttaching(true)
    try {
      await genreService.attachToMusic({
        music_id: selectedMusicIdForAttach as number,
        genre_id: Number(id)
      })
      toast.success('Musique attachée')
      setSelectedMusicIdForAttach('')
      await refetchGenreAndMusics()
    } catch {
      toast.error('Erreur lors de l\'attachement')
    } finally {
      setAttaching(false)
    }
  }

  const attachedIds = new Set(musics.map(m => m.id))
  const availableMusicsForAttach = allMusicsForAttach.filter(m => !attachedIds.has(m.id))

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  if (!genre) {
    return <Alert severity='error'>Genre introuvable</Alert>
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs
        items={[
          { label: 'Genres', href: getLocalizedUrl('/apps/ngoni/genres', lang as string) },
          { label: genre.name }
        ]}
      />

      {/* Header unifié */}
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
        <Box>
          <Typography variant='h4' fontWeight={600}>
            {genre.name}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant='tonal'
            color='secondary'
            size='medium'
            startIcon={<i className='tabler-arrow-left' />}
            onClick={() => router.push(getLocalizedUrl('/apps/ngoni/genres', lang as string))}
          >
            Liste
          </Button>
          {!editing ? (
            <>
              <Button variant='contained' size='medium' startIcon={<i className='tabler-edit' />} onClick={() => setEditing(true)}>
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
                disabled={submitting || !name.trim()}
                onClick={() => handleUpdate()}
              >
                {submitting ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Grid container spacing={6} sx={{ width: '100%' }} alignItems='flex-start'>
        {/* Colonne principale */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ width: '100%' }}>
            <CardContent sx={{ p: 6 }}>
              {editing ? (
                <form onSubmit={e => handleUpdate(e)}>
                  <Grid container spacing={4}>
                    <Grid size={{ xs: 12 }}>
                      <CustomTextField
                        fullWidth
                        label='Nom'
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        helperText={`${name.length}/50`}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <CustomTextField
                        fullWidth
                        multiline
                        rows={4}
                        label='Description'
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        helperText={`${description.length}/500`}
                      />
                    </Grid>
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
                        <Typography variant='body1' fontWeight={500}>{genre.id}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>Description</Typography>
                        <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap' }}>{genre.description || '—'}</Typography>
                      </Grid>
                    </Grid>
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
                          {genre.created_at ? new Date(genre.created_at).toLocaleString('fr-FR') : '—'}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>Dernière modification</Typography>
                        <Typography variant='body1'>
                          {genre.updated_at ? new Date(genre.updated_at).toLocaleString('fr-FR') : '—'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>

          {/* Musiques associées */}
          <Card sx={{ mt: 4, width: '100%' }}>
            <CardHeader
              title='Musiques associées'
              subheader={`${musics.length} musique${musics.length !== 1 ? 's' : ''} attachée${musics.length !== 1 ? 's' : ''}`}
            />
            <CardContent sx={{ pt: 0 }}>
              {!editing && (
                <Box display='flex' gap={2} alignItems='flex-end' flexWrap='wrap' sx={{ mb: 3 }}>
                  <CustomTextField
                    select
                    size='small'
                    label='Attacher une musique'
                    value={selectedMusicIdForAttach}
                    onChange={e => setSelectedMusicIdForAttach(e.target.value === '' ? '' : Number(e.target.value))}
                    sx={{ minWidth: 260 }}
                    disabled={availableMusicsForAttach.length === 0}
                  >
                    <MenuItem value="">
                      {availableMusicsForAttach.length === 0 ? 'Aucune musique disponible' : 'Sélectionner une musique'}
                    </MenuItem>
                    {availableMusicsForAttach.map(m => (
                      <MenuItem key={m.id} value={m.id}>{m.title}</MenuItem>
                    ))}
                  </CustomTextField>
                  <Button
                    variant='contained'
                    size='medium'
                    disabled={!selectedMusicIdForAttach || attaching}
                    onClick={handleAttachMusic}
                    startIcon={attaching ? <CircularProgress size={18} /> : <i className='tabler-link-plus' />}
                  >
                    {attaching ? 'Attachement...' : 'Attacher'}
                  </Button>
                </Box>
              )}
              {musics.length > 0 && !editing && <Divider sx={{ my: 3 }} />}
              {musics.length === 0 ? (
                <Box
                  sx={{
                    py: 6,
                    textAlign: 'center',
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'action.hover'
                  }}
                >
                  <i className='tabler-music-off' style={{ fontSize: 40, opacity: 0.5 }} />
                  <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                    Aucune musique associée. Utilisez le sélecteur ci-dessus pour en attacher.
                  </Typography>
                </Box>
              ) : (
                <Box component='ul' sx={{ m: 0, p: 0, listStyle: 'none' }}>
                  {musics.map(music => (
                    <Box
                      component='li'
                      key={music.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 2,
                        px: 2,
                        borderRadius: 1,
                        '&:nth-of-type(even)': { bgcolor: 'action.hover' },
                        '&:not(:last-child)': { borderBottom: '1px solid', borderColor: 'divider' }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <i className='tabler-music' />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant='body1' fontWeight={500} noWrap>
                            {music.title}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            ID {music.id}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        size='small'
                        color='error'
                        onClick={() => handleDetachMusic(music.id)}
                        aria-label='Détacher'
                        sx={{ flexShrink: 0 }}
                      >
                        <i className='tabler-unlink' />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ width: '100%', position: 'sticky', top: 100 }}>
            <CardHeader
              title='Résumé'
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography variant='caption' color='text.secondary' display='block' gutterBottom>
                  Musiques associées
                </Typography>
                <Typography variant='h4' fontWeight={600}>{musics.length}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
