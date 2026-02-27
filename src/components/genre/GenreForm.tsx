'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Type Imports
import type { Genre, GenreCreateRequest, GenreUpdateRequest } from '@/types/genre.types'

interface GenreFormProps {
  genre?: Genre
  onSubmit: (data: GenreCreateRequest | GenreUpdateRequest) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

const GenreForm = ({ genre, onSubmit, onCancel, loading = false }: GenreFormProps) => {
  const [formData, setFormData] = useState({
    name: genre?.name || '',
    description: genre?.description || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update form when genre prop changes
  useEffect(() => {
    if (genre) {
      setFormData({
        name: genre.name || '',
        description: genre.description || ''
      })
    }
  }, [genre])

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du genre est requis'
    }

    if (formData.name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères'
    }

    if (formData.name.trim().length > 50) {
      newErrors.name = 'Le nom ne peut pas dépasser 50 caractères'
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'La description ne peut pas dépasser 500 caractères'
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
      const submitData: GenreCreateRequest | GenreUpdateRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {/* Name Field */}
        <Grid item xs={12}>
          <CustomTextField
            fullWidth
            required
            label='Nom du genre'
            placeholder='Ex: Rock, Jazz, Hip-Hop'
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name || `${formData.name.length}/50 caractères`}
            disabled={loading}
          />
        </Grid>

        {/* Description Field */}
        <Grid item xs={12}>
          <CustomTextField
            fullWidth
            multiline
            rows={3}
            label='Description'
            placeholder='Entrez une description du genre (optionnel)'
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description || `${formData.description.length}/500 caractères`}
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
              startIcon={loading ? <CircularProgress size={20} /> : <i className='tabler-check' />}
            >
              {loading ? 'Enregistrement...' : (genre ? 'Mettre à jour' : 'Créer')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  )
}

export default GenreForm
