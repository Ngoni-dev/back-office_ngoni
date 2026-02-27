'use client'

import { toast } from 'react-toastify'
// React Imports
import { useState } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

// Service Imports
import { genreService } from '@/services/genre.service'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Component Imports
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import CustomTextField from '@core/components/mui/TextField'

export default function GenreForm() {
  const router = useRouter()
  const { lang } = useParams()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Le nom est requis')
      return
    }
    if (name.trim().length < 2) {
      toast.error('Le nom doit contenir au moins 2 caractères')
      return
    }
    if (description.length > 500) {
      toast.error('La description ne peut pas dépasser 500 caractères')
      return
    }

    setSubmitting(true)
    try {
      const response = await genreService.create({
        name: name.trim(),
        description: description.trim() || undefined
      })
      const created = response?.data
      toast.success('Genre créé avec succès')
      if (created?.id) {
        router.push(getLocalizedUrl(`/apps/ngoni/genres/${created.id}`, lang as string))
      } else {
        router.push(getLocalizedUrl('/apps/ngoni/genres', lang as string))
      }
    } catch {
      // Erreurs API déjà affichées par l'intercepteur
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(getLocalizedUrl('/apps/ngoni/genres', lang as string))
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs
        items={[
          { label: 'Genres', href: getLocalizedUrl('/apps/ngoni/genres', lang as string) },
          { label: 'Nouveau genre' }
        ]}
      />
      <Card sx={{ width: '100%' }}>
        <CardHeader
          title='Nouveau genre'
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
              <Grid size={{ xs: 12 }}>
                <Typography variant='subtitle1' fontWeight={600} color='text.secondary' sx={{ mb: 2 }}>
                  Informations
                </Typography>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12 }}>
                <CustomTextField
                  fullWidth
                  label='Nom du genre'
                  placeholder='Ex: Rock, Jazz, Hip-Hop'
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  helperText={`${name.length}/50 caractères`}
                />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                <CustomTextField
                  fullWidth
                  multiline
                  rows={3}
                  label='Description'
                  placeholder='Description optionnelle'
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  helperText={`${description.length}/500 caractères`}
                />
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
                    disabled={submitting || !name.trim()}
                    startIcon={submitting ? <i className='tabler-loader animate-spin' /> : <i className='tabler-check' />}
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
