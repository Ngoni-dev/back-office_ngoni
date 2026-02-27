'use client'

import { toast } from 'react-toastify'
// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// Service Imports
import { artistService } from '@/services/artist.service'
import { musicService } from '@/services/music.service'

// Type Imports
import type { Artist } from '@/types/artist.types'
import type { Music } from '@/types/music.types'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Component Imports
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import CustomTextField from '@core/components/mui/TextField'

type ArtistMusicItem = { id: number; title: string; duration?: number; duration_formatted?: string; role?: string }

interface ArtistDetailsProps {
  id: string
}

export default function ArtistDetails({ id }: ArtistDetailsProps) {
  const router = useRouter()
  const { lang } = useParams()

  const [artist, setArtist] = useState<Artist | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [musics, setMusics] = useState<ArtistMusicItem[]>([])
  const [allMusicsForAttach, setAllMusicsForAttach] = useState<Music[]>([])
  const [selectedMusicIdForAttach, setSelectedMusicIdForAttach] = useState<number | ''>('')
  const [attaching, setAttaching] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const response = await artistService.get(Number(id))
        const data = response?.data ?? response
        if (!data) throw new Error('Invalid response')

        setArtist(data)
        setName(data.name)
        setBio(data.bio || '')
        setImagePreview(data.profile_image_url ?? null)
        const rawMusics = data.musics ?? []
        setMusics(
          Array.isArray(rawMusics)
            ? rawMusics.map((m: { id: number; title: string; role?: string }) => ({
                id: m.id,
                title: m.title,
                duration: 0,
                duration_formatted: '—',
                role: m.role
              }))
            : []
        )
      } catch {
        toast.error('Erreur lors du chargement de l\'artiste')
        router.push(getLocalizedUrl('/apps/ngoni/artists', lang as string))
      } finally {
        setLoading(false)
      }
    }

    fetchArtist()
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
    if (artist) load()
  }, [artist])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
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
      const updateData: Record<string, unknown> = {
        name: name.trim(),
        bio: bio.trim() || undefined
      }
      if (imageFile) (updateData as Record<string, File>).profile_image = imageFile

      const response = await artistService.update(Number(id), updateData as { name: string; bio?: string; profile_image?: File })
      setArtist(response.data)
      setEditing(false)
      setImageFile(null)
      toast.success('Artiste mis à jour avec succès')
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerify = async () => {
    try {
      const response = await artistService.verify(Number(id))
      setArtist(response.data)
      toast.success('Artiste vérifié avec succès')
    } catch {
      toast.error('Erreur lors de la vérification')
    }
  }

  const handleUnverify = async () => {
    try {
      const response = await artistService.unverify(Number(id))
      setArtist(response.data)
      toast.success('Vérification retirée')
    } catch {
      toast.error('Erreur lors de la révocation')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet artiste ?')) return
    try {
      await artistService.delete(Number(id))
      toast.success('Artiste supprimé avec succès')
      router.push(getLocalizedUrl('/apps/ngoni/artists', lang as string))
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleCancel = () => {
    if (artist) {
      setName(artist.name)
      setBio(artist.bio || '')
      setImagePreview(artist.profile_image_url ?? null)
      setImageFile(null)
    }
    setEditing(false)
  }

  const refetchArtistAndMusics = async () => {
    const res = await artistService.get(Number(id))
    const data = res?.data ?? res
    if (!data) return
    setArtist(data)
    const rawMusics = data.musics ?? []
    setMusics(
      Array.isArray(rawMusics)
        ? rawMusics.map((m: { id: number; title: string; role?: string }) => ({
            id: m.id,
            title: m.title,
            duration: 0,
            duration_formatted: '—',
            role: m.role
          }))
        : []
    )
  }

  const handleDetachMusic = async (musicId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir détacher cette musique ?')) return
    try {
      await artistService.detachFromMusic(musicId, Number(id))
      toast.success('Musique détachée')
      await refetchArtistAndMusics()
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
      await artistService.attachToMusic({ music_id: selectedMusicIdForAttach as number, artist_id: Number(id) })
      toast.success('Musique attachée')
      setSelectedMusicIdForAttach('')
      await refetchArtistAndMusics()
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

  if (!artist) {
    return <Alert severity='error'>Artiste introuvable</Alert>
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs
        items={[
          { label: 'Artistes', href: getLocalizedUrl('/apps/ngoni/artists', lang as string) },
          { label: artist.name }
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Avatar
            src={editing ? (imagePreview || undefined) : (artist.profile_image_url || undefined)}
            alt={artist.name}
            sx={{ width: 64, height: 64 }}
          >
            {artist.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant='h4' fontWeight={600}>
              {artist.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              {artist.verified ? (
                <Box
                  component='span'
                  title='Vérifié'
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: '#1DA1F2',
                    color: 'white',
                    flexShrink: 0
                  }}
                >
                  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round'>
                    <polyline points='20 6 9 17 4 12' />
                  </svg>
                </Box>
              ) : (
                <Chip label='Non vérifié' size='small' variant='outlined' />
              )}
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant='tonal'
            color='secondary'
            size='medium'
            startIcon={<i className='tabler-arrow-left' />}
            onClick={() => router.push(getLocalizedUrl('/apps/ngoni/artists', lang as string))}
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

      <Grid container spacing={6} sx={{ width: '100%', minWidth: 0 }} alignItems='flex-start'>
        {/* Colonne principale */}
        <Grid size={{ xs: 12, md: 8 }} sx={{ minWidth: 0 }}>
          <Card sx={{ width: '100%' }}>
            <CardContent sx={{ p: 6 }}>
              {editing ? (
                <form onSubmit={e => handleUpdate(e)}>
                  <Grid container spacing={4}>
                    <Grid size={{ xs: 12 }}>
                      <Box display='flex' flexDirection='column' alignItems='center' gap={2}>
                        <Avatar
                          src={imagePreview || undefined}
                          alt={name}
                          sx={{ width: 120, height: 120 }}
                        >
                          {name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Button variant='tonal' component='label' size='medium'>
                          Changer l&apos;image
                          <input type='file' hidden accept='image/*' onChange={handleImageSelect} />
                        </Button>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <CustomTextField
                        fullWidth
                        label='Nom'
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <CustomTextField
                        fullWidth
                        multiline
                        rows={4}
                        label='Biographie'
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        helperText={`${bio.length}/1000 caractères`}
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
                        <Typography variant='body1' fontWeight={500}>{artist.id}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>Statut</Typography>
                        <Typography variant='body1' fontWeight={500}>{artist.verified ? 'Vérifié' : 'Non vérifié'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>Biographie</Typography>
                        <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap' }}>{artist.bio || '—'}</Typography>
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
                          {artist.created_at ? new Date(artist.created_at).toLocaleString('fr-FR') : '—'}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>Dernière modification</Typography>
                        <Typography variant='body1'>
                          {artist.updated_at ? new Date(artist.updated_at).toLocaleString('fr-FR') : '—'}
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {artist.verified ? (
                  <Button
                    variant='tonal'
                    color='warning'
                    size='medium'
                    fullWidth
                    startIcon={<i className='tabler-circle-x' />}
                    onClick={handleUnverify}
                  >
                    Dévérifier l&apos;artiste
                  </Button>
                ) : (
                  <Button
                    variant='tonal'
                    color='success'
                    size='medium'
                    fullWidth
                    startIcon={<i className='tabler-check' />}
                    onClick={handleVerify}
                  >
                    Vérifier l&apos;artiste
                  </Button>
                )}
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
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
