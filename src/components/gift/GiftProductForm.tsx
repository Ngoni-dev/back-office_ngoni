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
import FileUpload from '@/components/common/FileUpload'
import CustomTextField from '@core/components/mui/TextField'

// Type Imports
import type { GiftProduct, GiftProductCreateRequest, GiftProductUpdateRequest } from '@/types/gift.types'

interface GiftProductFormProps {
  product?: GiftProduct
  onSubmit: (data: GiftProductCreateRequest | GiftProductUpdateRequest) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

const GiftProductForm = ({ product, onSubmit, onCancel, loading = false }: GiftProductFormProps) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || ''
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url || null)
  
  const [animationFile, setAnimationFile] = useState<File | null>(null)
  const [animationPreview, setAnimationPreview] = useState<string | null>(product?.animation_url || null)
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update form when product prop changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || ''
      })
      setImagePreview(product.image_url || null)
      setAnimationPreview(product.animation_url || null)
    }
  }, [product])

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
    if (errors.image) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.image
        return newErrors
      })
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleAnimationSelect = (file: File) => {
    setAnimationFile(file)
    
    // Create preview for video/animation
    const reader = new FileReader()
    reader.onloadend = () => {
      setAnimationPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Clear error
    if (errors.animation) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.animation
        return newErrors
      })
    }
  }

  const handleRemoveAnimation = () => {
    setAnimationFile(null)
    setAnimationPreview(null)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du produit est requis'
    }

    if (formData.name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères'
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Le prix est requis'
    }

    const priceValue = parseFloat(formData.price)
    if (isNaN(priceValue) || priceValue < 0) {
      newErrors.price = 'Le prix doit être un nombre positif'
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
      const submitData: GiftProductCreateRequest | GiftProductUpdateRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: parseFloat(formData.price),
      }

      // Add image file if selected
      if (imageFile) {
        submitData.image = imageFile
      }

      // Add animation file if selected
      if (animationFile) {
        submitData.animation = animationFile
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
          title={product ? 'Modifier le produit cadeau' : 'Nouveau produit cadeau'}
          subheader={product ? `ID: ${product.id}` : 'Créer un nouveau produit cadeau'}
        />
        <CardContent>
          <Grid container spacing={4}>
            {/* Image Upload Section */}
            <Grid item xs={12} md={6}>
              <Box display='flex' flexDirection='column' alignItems='center' gap={2}>
                <Typography variant='subtitle2' color='text.secondary'>
                  Image du produit
                </Typography>
                <Avatar
                  src={imagePreview || undefined}
                  alt={formData.name}
                  variant='rounded'
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
                  label='Image du produit'
                  helperText='PNG, JPG ou JPEG (max 5MB)'
                />

                {errors.image && (
                  <Typography variant='caption' color='error'>
                    {errors.image}
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* Animation Upload Section */}
            <Grid item xs={12} md={6}>
              <Box display='flex' flexDirection='column' alignItems='center' gap={2}>
                <Typography variant='subtitle2' color='text.secondary'>
                  Animation du produit
                </Typography>
                
                {animationPreview ? (
                  <Box position='relative'>
                    <video
                      src={animationPreview}
                      style={{ width: 120, height: 120, borderRadius: 8, objectFit: 'cover' }}
                      autoPlay
                      loop
                      muted
                    />
                    <IconButton
                      size='small'
                      color='error'
                      onClick={handleRemoveAnimation}
                      sx={{ position: 'absolute', top: -8, right: -8 }}
                    >
                      <i className='tabler-trash' />
                    </IconButton>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: 2,
                      border: '2px dashed',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <i className='tabler-movie' style={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                )}

                <FileUpload
                  accept='video/*,.gif'
                  maxSize={10 * 1024 * 1024} // 10MB
                  onFileSelect={handleAnimationSelect}
                  label='Animation du produit'
                  helperText='MP4, GIF ou WEBM (max 10MB)'
                />

                {errors.animation && (
                  <Typography variant='caption' color='error'>
                    {errors.animation}
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* Name Field */}
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                required
                label='Nom du produit'
                placeholder='Entrez le nom du produit cadeau'
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                disabled={loading}
              />
            </Grid>

            {/* Price Field */}
            <Grid item xs={12} md={6}>
              <CustomTextField
                fullWidth
                required
                type='number'
                label='Prix'
                placeholder='Entrez le prix'
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                error={!!errors.price}
                helperText={errors.price}
                disabled={loading}
                InputProps={{
                  endAdornment: <Typography variant='body2' color='text.secondary'>XAF</Typography>
                }}
              />
            </Grid>

            {/* Description Field */}
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                multiline
                rows={4}
                label='Description'
                placeholder='Entrez la description du produit (optionnel)'
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
                  startIcon={loading ? <i className='tabler-loader animate-spin' /> : <i className='tabler-check' />}
                >
                  {loading ? 'Enregistrement...' : (product ? 'Mettre à jour' : 'Créer')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </form>
  )
}

export default GiftProductForm
