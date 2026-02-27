'use client'

import { toast } from 'react-toastify'
// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// Service Imports
import { artistService } from '@/services/artist.service'
import { genreService } from '@/services/genre.service'
import { musicService } from '@/services/music.service'

// Type Imports
import type { MusicArtist, MusicGenre } from '@/types/music.types'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Component Imports
import FileUpload from '@/components/common/FileUpload'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import CustomTextField from '@core/components/mui/TextField'

export default function MusicForm() {
  const router = useRouter()
  const { lang } = useParams()

  // Form state
  const [title, setTitle] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [language, setLanguage] = useState('')
  const [isOriginal, setIsOriginal] = useState(false)
  const [selectedArtists, setSelectedArtists] = useState<number[]>([])
  const [selectedGenres, setSelectedGenres] = useState<number[]>([])

  // Data state
  const [artists, setArtists] = useState<MusicArtist[]>([])
  const [genres, setGenres] = useState<MusicGenre[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Fetch artists and genres
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artistsRes, genresRes] = await Promise.all([
          artistService.list(1, 100),
          genreService.list()
        ])
        setArtists(artistsRes.data ?? [])
        setGenres(genresRes.data ?? [])
      } catch (error) {
        toast.error('Erreur lors du chargement des données')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Le titre est requis')

      return
    }

    if (!audioFile) {
      toast.error('Le fichier audio est requis')

      return
    }

    setSubmitting(true)

    try {
      const response = await musicService.create({
        title: title.trim(),
        audio_file: audioFile,
        language: language || undefined,
        is_original: isOriginal,
        artist_ids: selectedArtists.length > 0 ? selectedArtists : undefined,
        genre_ids: selectedGenres.length > 0 ? selectedGenres : undefined
      })

      const created = response?.data
      toast.success('Musique créée avec succès')
      if (created?.id) {
        router.push(getLocalizedUrl(`/apps/ngoni/music/${created.id}`, lang as string))
      } else {
        router.push(getLocalizedUrl('/apps/ngoni/music', lang as string))
      }
    } catch {
      // Erreurs API (422, 500, etc.) déjà affichées par l'intercepteur
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(getLocalizedUrl('/apps/ngoni/music', lang as string))
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs
        items={[
          { label: 'Music', href: getLocalizedUrl('/apps/ngoni/music', lang as string) },
          { label: 'Nouvelle musique' }
        ]}
      />
      <Card sx={{ width: '100%' }}>
        <CardHeader
          title='Ajouter une musique'
          action={
            <Button
              variant='tonal'
              color='secondary'
              startIcon={<i className='tabler-arrow-left' />}
              onClick={handleCancel}
            >
              Retour à la liste
            </Button>
          }
        />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={6}>
              {/* Informations principales */}
              <Grid size={{ xs: 12 }}>
                <Typography variant='subtitle1' fontWeight={600} color='text.secondary' sx={{ mb: 2 }}>
                  Informations principales
                </Typography>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12 }}>
                    <CustomTextField
                  fullWidth
                  label='Titre'
                  placeholder='Entrez le titre de la musique'
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                <FileUpload
                  onFileSelect={setAudioFile}
                  accept={{
                    'audio/mpeg': ['.mp3'],
                    'audio/wav': ['.wav'],
                    'audio/x-wav': ['.wav'],
                    'audio/ogg': ['.ogg'],
                    'audio/mp4': ['.m4a', '.mp4'],
                    'audio/x-m4a': ['.m4a'],
                    'audio/flac': ['.flac']
                  }}
                  maxSize={50 * 1024 * 1024}
                  label='Glissez-déposez un fichier audio ici ou cliquez pour sélectionner'
                  helperText='Formats acceptés: MP3, WAV, OGG, M4A, FLAC (max 50MB)'
                  currentFile={audioFile}
                  showProgress={submitting}
                />
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant='subtitle1' fontWeight={600} color='text.secondary' sx={{ mb: 2 }}>
                  Métadonnées
                </Typography>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextField
                  fullWidth
                  label='Langue'
                  placeholder='Ex: fr, en, es'
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  helperText='Code de langue ISO 639-1 (optionnel)'
                />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={<Checkbox checked={isOriginal} onChange={e => setIsOriginal(e.target.checked)} />}
                  label='Composition originale'
                />
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant='subtitle1' fontWeight={600} color='text.secondary' sx={{ mb: 2 }}>
                  Associations
                </Typography>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextField
                  select
                  fullWidth
                  label='Artistes'
                  value={selectedArtists}
                  onChange={e => {
                    const v = e.target.value
                    setSelectedArtists(Array.isArray(v) ? v.map(x => Number(x)) : [])
                  }}
                  SelectProps={{
                    multiple: true,
                    renderValue: (selected: unknown) => {
                      const ids = Array.isArray(selected) ? selected.map(Number) : []
                      if (ids.length === 0) return 'Aucun'
                      if (ids.length <= 2) {
                        return ids.map(id => artists.find(a => a.id === id)?.name ?? id).filter(Boolean).join(', ')
                      }
                      return `${ids.length} artistes sélectionnés`
                    }
                  }}
                  helperText='Sélectionnez un ou plusieurs artistes'
                >
                  {artists.map(artist => (
                    <MenuItem key={artist.id} value={artist.id}>
                      {artist.name}
                    </MenuItem>
                  ))}
                </CustomTextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextField
                  select
                  fullWidth
                  label='Genres'
                  value={selectedGenres}
                  onChange={e => {
                    const v = e.target.value
                    setSelectedGenres(Array.isArray(v) ? v.map(x => Number(x)) : [])
                  }}
                  SelectProps={{
                    multiple: true,
                    renderValue: (selected: unknown) => {
                      const ids = Array.isArray(selected) ? selected.map(Number) : []
                      if (ids.length === 0) return 'Aucun'
                      if (ids.length <= 2) {
                        return ids.map(id => genres.find(g => g.id === id)?.name ?? id).filter(Boolean).join(', ')
                      }
                      return `${ids.length} genres sélectionnés`
                    }
                  }}
                  helperText='Sélectionnez un ou plusieurs genres'
                >
                  {genres.map(genre => (
                    <MenuItem key={genre.id} value={genre.id}>
                      {genre.name}
                    </MenuItem>
                  ))}
                </CustomTextField>
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box display='flex' gap={2} justifyContent='flex-end'>
                  <Button variant='tonal' color='secondary' onClick={handleCancel} disabled={submitting}>
                    Annuler
                  </Button>
                  <Button
                    type='submit'
                    variant='contained'
                    disabled={submitting || !title.trim() || !audioFile}
                    startIcon={submitting ? <CircularProgress size={20} /> : undefined}
                  >
                    {submitting ? 'Création...' : 'Créer'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}
