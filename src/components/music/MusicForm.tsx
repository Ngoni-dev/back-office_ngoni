'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, pipe, minLength, optional, array, number, boolean, custom } from 'valibot'
import type { InferInput } from 'valibot'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import FileUpload from '@/components/common/FileUpload'

// Type Imports
import type { Music, MusicCreateRequest, MusicUpdateRequest } from '@/types/music.types'

interface MusicFormProps {
  music?: Music
  onSubmit: (data: MusicCreateRequest | MusicUpdateRequest) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

// Validation schema for create
const createSchema = object({
  title: pipe(string(), minLength(1, 'Le titre est requis')),
  audio_file: custom<File>((value) => value instanceof File, 'Le fichier audio est requis'),
  country_id: optional(number()),
  language: optional(string()),
  is_original: optional(boolean()),
  artist_ids: optional(array(number())),
  genre_ids: optional(array(number()))
})

// Validation schema for update
const updateSchema = object({
  title: pipe(string(), minLength(1, 'Le titre est requis')),
  country_id: optional(number()),
  language: optional(string()),
  is_original: optional(boolean()),
  artist_ids: optional(array(number())),
  genre_ids: optional(array(number()))
})

type CreateFormData = InferInput<typeof createSchema>
type UpdateFormData = InferInput<typeof updateSchema>

const MusicForm = ({ music, onSubmit, onCancel, loading }: MusicFormProps) => {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const isEditMode = !!music

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<CreateFormData | UpdateFormData>({
    resolver: valibotResolver(isEditMode ? updateSchema : createSchema),
    defaultValues: {
      title: music?.title || '',
      country_id: music?.country_id || undefined,
      language: music?.language || '',
      is_original: music?.is_original || false,
      artist_ids: music?.artists?.map(a => a.id) || [],
      genre_ids: music?.genres?.map(g => g.id) || []
    }
  })

  const handleFileSelect = (file: File) => {
    setAudioFile(file)
    if (!isEditMode) {
      setValue('audio_file' as any, file)
    }
  }

  const handleFormSubmit = async (data: CreateFormData | UpdateFormData) => {
    try {
      if (isEditMode) {
        await onSubmit(data as MusicUpdateRequest)
      } else {
        await onSubmit({
          ...data,
          audio_file: audioFile!
        } as MusicCreateRequest)
      }
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <Card>
      <CardHeader
        title={isEditMode ? 'Modifier la musique' : 'Ajouter une nouvelle musique'}
        subheader={isEditMode ? 'Modifiez les informations de la musique' : 'Remplissez les informations de la musique'}
      />
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Grid container spacing={4}>
            {/* Title */}
            <Grid item xs={12}>
              <Controller
                name='title'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Titre de la musique'
                    placeholder='Entrez le titre'
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>

            {/* Audio File Upload - Only for create mode */}
            {!isEditMode && (
              <Grid item xs={12}>
                <FileUpload
                  label='Fichier audio'
                  accept='audio/*'
                  maxSize={50 * 1024 * 1024} // 50MB
                  onFileSelect={handleFileSelect}
                  helperText='Formats acceptés: MP3, WAV, FLAC (max 50MB)'
                  error={!!errors.audio_file}
                  errorMessage={errors.audio_file?.message as string}
                />
              </Grid>
            )}

            {/* Language */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='language'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Langue'
                    placeholder='Ex: Français, Anglais'
                    error={!!errors.language}
                    helperText={errors.language?.message}
                  />
                )}
              />
            </Grid>

            {/* Country ID */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='country_id'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label='ID du pays'
                    placeholder='Entrez l\'ID du pays'
                    error={!!errors.country_id}
                    helperText={errors.country_id?.message}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                )}
              />
            </Grid>

            {/* Is Original */}
            <Grid item xs={12}>
              <Controller
                name='is_original'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value || false}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label='Musique originale'
                  />
                )}
              />
              <FormHelperText>
                Cochez si cette musique est une création originale
              </FormHelperText>
            </Grid>

            {/* Artist IDs - Placeholder for future multi-select */}
            <Grid item xs={12}>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                Artistes (à implémenter avec sélection multiple)
              </Typography>
              <FormHelperText>
                La sélection des artistes sera disponible après l'implémentation du module Artistes
              </FormHelperText>
            </Grid>

            {/* Genre IDs - Placeholder for future multi-select */}
            <Grid item xs={12}>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                Genres (à implémenter avec sélection multiple)
              </Typography>
              <FormHelperText>
                La sélection des genres sera disponible après l'implémentation du module Genres
              </FormHelperText>
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
                  disabled={loading || (!isEditMode && !audioFile)}
                  startIcon={loading ? <i className='tabler-loader' /> : <i className='tabler-check' />}
                >
                  {loading ? 'Enregistrement...' : isEditMode ? 'Mettre à jour' : 'Créer'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default MusicForm
