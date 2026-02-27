'use client'

import { toast } from 'react-toastify'
// React Imports
import { useState } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

// Service Imports
import { artistService } from '@/services/artist.service'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Component Imports
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import CustomTextField from '@core/components/mui/TextField'

export default function ArtistForm() {
  const router = useRouter()
  const { lang } = useParams()

  // Form state
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 5MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Le fichier doit être une image')
        return
      }

      setImageFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

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

    if (bio.length > 1000) {
      toast.error('La biographie ne peut pas dépasser 1000 caractères')
      return
    }

    setSubmitting(true)

    try {
      const response = await artistService.create({
        name: name.trim(),
        bio: bio.trim() || undefined,
        profile_image: imageFile || undefined
      })

      const created = response?.data
      toast.success('Artiste créé avec succès')
      if (created?.id) {
        router.push(getLocalizedUrl(`/apps/ngoni/artists/${created.id}`, lang as string))
      } else {
        router.push(getLocalizedUrl('/apps/ngoni/artists', lang as string))
      }
    } catch {
      // Erreurs API déjà affichées par l'intercepteur
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(getLocalizedUrl('/apps/ngoni/artists', lang as string))
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs
        items={[
          { label: 'Artistes', href: getLocalizedUrl('/apps/ngoni/artists', lang as string) },
          { label: 'Nouvel artiste' }
        ]}
      />
      <Card sx={{ width: '100%' }}>
        <CardHeader
          title='Ajouter un artiste'
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
                  Photo de profil
                </Typography>
                <Box display='flex' flexDirection='column' alignItems='center' gap={2}>
                  <Avatar
                    src={imagePreview || undefined}
                    alt={name}
                    sx={{ width: 120, height: 120 }}
                  >
                    {name ? name.charAt(0).toUpperCase() : <i className='tabler-user' />}
                  </Avatar>
                  <Button variant='tonal' component='label'>
                    Sélectionner une image
                    <input type='file' hidden accept='image/*' onChange={handleImageSelect} />
                  </Button>
                  {imageFile && (
                    <Box display='flex' alignItems='center' gap={1}>
                      <i className='tabler-file' />
                      <span className='text-sm'>{imageFile.name}</span>
                      <Button
                        size='small'
                        color='error'
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview(null)
                        }}
                      >
                        <i className='tabler-x' />
                      </Button>
                    </Box>
                  )}
                  <span className='text-xs text-textSecondary'>
                    PNG, JPG ou JPEG (max 5MB)
                  </span>
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant='subtitle1' fontWeight={600} color='text.secondary' sx={{ mb: 2 }}>
                  Informations
                </Typography>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12 }}>
                    <CustomTextField
                      fullWidth
                      label={"Nom de l'artiste"}
                      placeholder={"Entrez le nom de l'artiste"}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      helperText='Minimum 2 caractères'
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <CustomTextField
                      fullWidth
                      multiline
                      rows={4}
                      label='Biographie'
                      placeholder={"Entrez la biographie de l'artiste (optionnel)"}
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      helperText={`${bio.length}/1000 caractères`}
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
