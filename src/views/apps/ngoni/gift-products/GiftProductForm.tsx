'use client'

import { toast } from 'react-toastify'
// React Imports
import { useEffect, useState } from 'react'

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
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// Service Imports
import { giftProductService } from '@/services/gift.service'

// Type Imports
import type { GiftProductCreateRequest } from '@/types/gift.types'
import { GIFT_CATEGORIES } from '@/types/gift.types'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Component Imports
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import CustomTextField from '@core/components/mui/TextField'

const CATEGORY_LABELS: Record<string, string> = {
  FLOWER: 'Fleur',
  JEWELRY: 'Bijoux',
  SPECIAL: 'Spécial',
  SEASONAL: 'Saisonnier',
  OTHER: 'Autre'
}

export default function GiftProductForm() {
  const router = useRouter()
  const { lang } = useParams()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [animationFile, setAnimationFile] = useState<File | null>(null)
  const [animationPreview, setAnimationPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 5 Mo')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleAnimationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('L\'animation ne doit pas dépasser 10 Mo')
        return
      }
      if (animationPreview?.startsWith('blob:')) URL.revokeObjectURL(animationPreview)
      setAnimationFile(file)
      setAnimationPreview(URL.createObjectURL(file))
    }
  }

  const handleRemoveAnimation = () => {
    if (animationPreview?.startsWith('blob:')) URL.revokeObjectURL(animationPreview)
    setAnimationFile(null)
    setAnimationPreview(null)
  }

  useEffect(() => {
    return () => {
      if (animationPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(animationPreview)
      }
    }
  }, [animationPreview])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const priceNum = parseFloat(price.replace(',', '.'))
    if (!name.trim()) {
      toast.error('Le nom est requis')
      return
    }
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('Le prix doit être un nombre positif')
      return
    }

    setSubmitting(true)
    try {
      const data: GiftProductCreateRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        price: priceNum,
        category: category || undefined,
        image: imageFile || undefined,
        animation: animationFile || undefined
      }
      const response = await giftProductService.create(data)
      const created = response?.data
      toast.success('Produit créé avec succès')
      if (created?.id) {
        router.push(getLocalizedUrl(`/apps/ngoni/gift-products/${created.id}`, lang as string))
      } else {
        router.push(getLocalizedUrl('/apps/ngoni/gift-products', lang as string))
      }
    } catch {
      // Erreurs API déjà affichées par l'intercepteur
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(getLocalizedUrl('/apps/ngoni/gift-products', lang as string))
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs
        items={[
          { label: 'Produits cadeaux', href: getLocalizedUrl('/apps/ngoni/gift-products', lang as string) },
          { label: 'Nouveau produit' }
        ]}
      />
      <Card sx={{ width: '100%' }}>
        <CardHeader
          title='Nouveau produit cadeau'
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
                  Informations principales
                </Typography>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                <CustomTextField
                  fullWidth
                  label='Nom'
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder='Nom du produit'
                />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                <CustomTextField
                  fullWidth
                  label='Prix'
                  type='text'
                  inputMode='decimal'
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  required
                  placeholder='0'
                  helperText='Nombre positif (ex: 1000 ou 99.99)'
                />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                <CustomTextField
                  select
                  fullWidth
                  label='Catégorie'
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <MenuItem value="">Aucune</MenuItem>
                  {GIFT_CATEGORIES.map(cat => (
                    <MenuItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat] ?? cat}
                    </MenuItem>
                  ))}
                </CustomTextField>
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant='subtitle1' fontWeight={600} color='text.secondary' sx={{ mb: 2 }}>
                  Description
                </Typography>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12 }}>
                <CustomTextField
                  fullWidth
                  multiline
                  rows={3}
                  label='Description'
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  helperText={`${description.length}/2000`}
                />
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant='subtitle1' fontWeight={600} color='text.secondary' sx={{ mb: 2 }}>
                  Médias (optionnel)
                </Typography>
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 2 }}>
                  Image (optionnel)
                </Typography>
                <Box display='flex' alignItems='center' gap={2} flexWrap='wrap'>
                  <Avatar
                    src={imagePreview || undefined}
                    alt={name || 'Image'}
                    variant='rounded'
                    sx={{ width: 100, height: 100 }}
                  >
                    {name ? name.charAt(0).toUpperCase() : <i className='tabler-photo' />}
                  </Avatar>
                  <Box>
                    <Button variant='tonal' component='label' size='medium'>
                      {imageFile ? imageFile.name : "Choisir une image"}
                      <input type='file' hidden accept='image/*' onChange={handleImageChange} />
                    </Button>
                    {imageFile && (
                      <Button
                        size='small'
                        color='error'
                        onClick={handleRemoveImage}
                        sx={{ ml: 1 }}
                        startIcon={<i className='tabler-x' />}
                      >
                        Supprimer
                      </Button>
                    )}
                  </Box>
                </Box>
                <Typography variant='caption' color='text.secondary' display='block' sx={{ mt: 0.5 }}>
                  JPEG, PNG, GIF, WebP — max 5 Mo
                </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 2 }}>
                  Animation (optionnel)
                </Typography>
                <Box
                  sx={{
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                    bgcolor: 'action.hover',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 140,
                    mb: 2
                  }}
                >
                  {animationPreview ? (
                    (() => {
                      const isVideo = animationFile?.type.startsWith('video/')
                      return isVideo ? (
                        <video
                          src={animationPreview}
                          autoPlay
                          loop
                          muted
                          playsInline
                          style={{ maxWidth: '100%', maxHeight: 180, objectFit: 'contain' }}
                        />
                      ) : (
                        <img
                          src={animationPreview}
                          alt='Animation'
                          style={{ maxWidth: '100%', maxHeight: 180, objectFit: 'contain' }}
                        />
                      )
                    })()
                  ) : (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <i className='tabler-photo-off' style={{ fontSize: 40, opacity: 0.4 }} />
                      <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                        Aucune animation
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Box display='flex' alignItems='center' gap={2} flexWrap='wrap'>
                  <Button variant='tonal' component='label' size='medium'>
                    {animationFile ? animationFile.name : "Choisir une animation"}
                    <input type='file' hidden accept='.gif,.webp,.png,.jpeg,.jpg,.mp4,.webm' onChange={handleAnimationChange} />
                  </Button>
                  {animationFile && (
                    <Button
                      size='small'
                      color='error'
                      onClick={handleRemoveAnimation}
                      startIcon={<i className='tabler-x' />}
                    >
                      Supprimer
                    </Button>
                  )}
                </Box>
                <Typography variant='caption' color='text.secondary' display='block' sx={{ mt: 0.5 }}>
                  GIF, WebP, PNG, JPEG, MP4, WebM — max 10 Mo
                </Typography>
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
                    disabled={submitting || !name.trim() || !price}
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
