'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import FileUpload from '@/components/common/FileUpload'

// Type Imports
import type { Artist, ArtistCreateRequest, ArtistUpdateRequest } from '@/types/artist.types'

interface ArtistFormProps {
  artist?: Artist
  onSubmit: (data: ArtistCreateRequest | ArtistUpdateRequest) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

const ArtistForm = ({ artist, onSubmit, onCancel, loading = false }: ArtistFormProps) => {
  const [formData, setFormData] = useState({
    name: artist?.name || '',
    bio: artist?.bio || ''
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(artist?.profile_image_url || null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update form when artist prop changes
  useEffect(() => {
    if (artist) {
      setFormData({
        name: artist.name || '',
        bio: artist.bio || ''
      })
      setImagePreview(artist.profile_image_url || null)
    }
  }, [artist])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleImageSelect = (file: File) => {
    setImageFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Clear error
    if (errors.profile_image) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.profile_image
        return newErrors
      })
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de l\'artiste est requis'
    }

    if (formData.name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères'
    }

    if (formData.bio && formData.bio.length > 1000) {
      newErrors.bio = 'La biographie ne peut pas dépasser 1000 caractères'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const submitData: ArtistCreateRequest | ArtistUpdateRequest = {
        name: formData.name.trim(),
        bio: formData.bio.trim() || undefined,
      }

      // Add image file if selected
      if (imageFile) {
        submitData.profile_image = imageFile
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader
          title={artist ? 'Modifier l\'artiste' : 'Nouvel artiste'}
          subheader={artist ? `ID: ${artist.id}` : 'Créer un nouvel artiste'}
        />
        <CardContent>
          <Grid container spacing={4}>
            {/* Image Upload Section */}
            <Grid item xs={12}>
              <Box display='flex' flexDirection='column' alignItems='center' gap={2}>
                <Avatar
                  src={imagePreview || undefined}
                  alt={formData.name}
                  sx={{ width: 120, height: 120 }}
                >
                  {!imagePreview && formData.name.charAt(0).toUpperCase()}
                </Avatar>

                {imagePreview && (
                  <IconButton
                    size='small'
                    color='error'
                    onClick={handleRemoveImage}
                    sx={{ mt: -1 }}
                  >
                    <i className='tabler-trash' />
                  </IconButton>
                )}

                <FileUpload
                  accept='image/*'
                  maxSize={5 * 1024 * 1024} // 5MB
                  onFileSelect={handleImageSelect}
                  label='Image de profil'
                  helperText='PNG, JPG ou JPEG (max 5MB)'
                />

                {errors.profile_image && (
                  <Typography variant='caption' color='error'>
                    {errors.profile_image}
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* Name Field */}
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                required
                label='Nom de l\'artiste'
                placeholder='Entrez le nom de l\'artiste'
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                disabled={loading}
              />
            </Grid>

            {/* Bio Field */}
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                multiline
                rows={4}
                label='Biographie'
                placeholder='Entrez la biographie de l\'artiste (optionnel)'
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                error={!!errors.bio}
                helperText={errors.bio || `${formData.bio.length}/1000 caractères`}
                disabled={loading}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box display='flex' gap={2} justifyContent='flex-end'>
                {onCancel && (
                  <Button
                    variant='tonal'
                    color='secondary'
                    onClick={onCancel}
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                )}
                <Button
                  type='submit'
                  variant='contained'
                  disabled={loading}
                  startIcon={loading ? <i className='tabler-loader animate-spin' /> : <i className='tabler-check' />}
                >
                  {loading ? 'Enregistrement...' : (artist ? 'Mettre à jour' : 'Créer')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </form>
  )
}

export default ArtistForm
