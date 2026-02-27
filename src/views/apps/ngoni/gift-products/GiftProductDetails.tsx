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
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// Service Imports
import { giftProductService } from '@/services/gift.service'

// Type Imports
import type { GiftProduct, GiftProductUpdateRequest } from '@/types/gift.types'
import { GIFT_CATEGORIES } from '@/types/gift.types'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Component Imports
import DeleteConfirmDialog from '@/components/dialogs/DeleteConfirmDialog'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import CustomTextField from '@core/components/mui/TextField'

const CATEGORY_LABELS: Record<string, string> = {
  FLOWER: 'Fleur',
  JEWELRY: 'Bijoux',
  SPECIAL: 'Spécial',
  SEASONAL: 'Saisonnier',
  OTHER: 'Autre'
}

interface GiftProductDetailsProps {
  id: string
}

export default function GiftProductDetails({ id }: GiftProductDetailsProps) {
  const router = useRouter()
  const { lang } = useParams()

  const [product, setProduct] = useState<GiftProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [animationFile, setAnimationFile] = useState<File | null>(null)
  const [animationPreview, setAnimationPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const fetchProduct = async () => {
    try {
      const response = await giftProductService.get(Number(id))
      const data = response?.data ?? response
      if (!data) throw new Error('Invalid response')
      setProduct(data)
      setName(data.name)
      setDescription(data.description ?? '')
      setPrice(String(data.price))
      setCategory(data.category ?? '')
      setImagePreview(data.image_url ?? null)
    } catch {
      toast.error('Erreur lors du chargement du produit')
      router.push(getLocalizedUrl('/apps/ngoni/gift-products', lang as string))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProduct()
  }, [id, router, lang])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleAnimationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAnimationFile(file)
      setAnimationPreview(URL.createObjectURL(file))
    }
  }

  useEffect(() => {
    return () => {
      if (animationPreview && animationPreview.startsWith('blob:')) {
        URL.revokeObjectURL(animationPreview)
      }
    }
  }, [animationPreview])

  const handleUpdate = async (e: React.FormEvent) => {
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
      const data: GiftProductUpdateRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        price: priceNum,
        category: category || undefined,
        image: imageFile || undefined,
        animation: animationFile || undefined
      }
      const updated = await giftProductService.update(Number(id), data)
      setProduct(updated.data)
      setEditing(false)
      setImageFile(null)
      setImagePreview(updated.data.image_url ?? imagePreview)
      if (animationPreview?.startsWith('blob:')) URL.revokeObjectURL(animationPreview)
      setAnimationPreview(null)
      setAnimationFile(null)
      toast.success('Produit mis à jour')
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (product) {
      setName(product.name)
      setDescription(product.description ?? '')
      setPrice(String(product.price))
      setCategory(product.category ?? '')
      setImagePreview(product.image_url ?? null)
      setImageFile(null)
      if (animationPreview?.startsWith('blob:')) URL.revokeObjectURL(animationPreview)
      setAnimationPreview(null)
      setAnimationFile(null)
    }
    setEditing(false)
  }

  const handleDelete = async () => {
    try {
      await giftProductService.delete(Number(id))
      toast.success('Produit supprimé')
      router.push(getLocalizedUrl('/apps/ngoni/gift-products', lang as string))
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleToggleActive = async () => {
    try {
      const updated = await giftProductService.toggleActive(Number(id))
      setProduct(updated.data)
      toast.success(updated.data.is_active ? 'Produit activé' : 'Produit désactivé')
    } catch {
      toast.error('Erreur lors du changement de statut')
    }
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  if (!product) {
    return <Alert severity='error'>Produit introuvable</Alert>
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs
        items={[
          { label: 'Produits cadeaux', href: getLocalizedUrl('/apps/ngoni/gift-products', lang as string) },
          { label: product.name }
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
            src={editing ? (imagePreview || undefined) : (product.image_url || undefined)}
            alt={product.name}
            variant='rounded'
            sx={{ width: 64, height: 64 }}
          >
            {product.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant='h4' fontWeight={600}>
              {product.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Chip
                label={product.is_active ? 'Actif' : 'Inactif'}
                color={product.is_active ? 'success' : 'default'}
                size='small'
                variant='tonal'
              />
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant='tonal'
            color='secondary'
            size='medium'
            startIcon={<i className='tabler-arrow-left' />}
            onClick={() => router.push(getLocalizedUrl('/apps/ngoni/gift-products', lang as string))}
          >
            Liste
          </Button>
          {!editing ? (
            <>
              <Button variant='contained' size='medium' startIcon={<i className='tabler-edit' />} onClick={() => setEditing(true)}>
                Modifier
              </Button>
              <Button variant='tonal' color='error' size='medium' startIcon={<i className='tabler-trash' />} onClick={() => setDeleteDialogOpen(true)}>
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
                startIcon={submitting ? <i className='tabler-loader animate-spin' /> : <i className='tabler-check' />}
                disabled={submitting || !name.trim() || !price}
                onClick={e => handleUpdate(e)}
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
                <form onSubmit={handleUpdate}>
                  <Grid container spacing={4}>
                    <Grid size={{ xs: 12 }}><CustomTextField fullWidth label='Nom' value={name} onChange={e => setName(e.target.value)} required /></Grid>
                    <Grid size={{ xs: 12, sm: 6 }}><CustomTextField fullWidth label='Prix' type='text' inputMode='decimal' value={price} onChange={e => setPrice(e.target.value)} required /></Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CustomTextField select fullWidth label='Catégorie' value={category} onChange={e => setCategory(e.target.value)}>
                        <MenuItem value="">Aucune</MenuItem>
                        {GIFT_CATEGORIES.map(cat => (
                          <MenuItem key={cat} value={cat}>{CATEGORY_LABELS[cat] ?? cat}</MenuItem>
                        ))}
                      </CustomTextField>
                    </Grid>
                    <Grid size={{ xs: 12 }}><CustomTextField fullWidth multiline rows={3} label='Description' value={description} onChange={e => setDescription(e.target.value)} helperText={`${description.length}/2000`} /></Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 2 }}>Image du produit</Typography>
                      <Box display='flex' alignItems='center' gap={2} flexWrap='wrap'>
                        <Avatar src={imagePreview || undefined} alt={name} variant='rounded' sx={{ width: 100, height: 100 }}>{name.charAt(0).toUpperCase()}</Avatar>
                        <Button variant='tonal' component='label' size='medium'>Changer l&apos;image<input type='file' hidden accept='image/*' onChange={handleImageChange} /></Button>
                        {imageFile && <Typography variant='caption'>{imageFile.name}</Typography>}
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 2 }}>Animation</Typography>
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
                        {(animationPreview || (product.animation_url && !animationFile)) ? (() => {
                          const url = animationPreview || product.animation_url || ''
                          const isVideo = animationFile
                            ? animationFile.type.startsWith('video/')
                            : /\.(mp4|webm|ogg)$/i.test(product.animation_url || '')
                          return isVideo ? (
                            <video src={url} autoPlay loop muted playsInline style={{ maxWidth: '100%', maxHeight: 180, objectFit: 'contain' }} />
                          ) : (
                            <img src={url} alt='Animation' style={{ maxWidth: '100%', maxHeight: 180, objectFit: 'contain' }} />
                          )
                        })() : (
                          <Box sx={{ py: 4, textAlign: 'center' }}>
                            <i className='tabler-photo-off' style={{ fontSize: 40, opacity: 0.4 }} />
                            <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>Aucune animation</Typography>
                          </Box>
                        )}
                      </Box>
                      <Box display='flex' alignItems='center' gap={2} flexWrap='wrap'>
                        <Button variant='tonal' component='label' size='medium'>
                          {animationFile ? animationFile.name : 'Changer l\'animation'}
                          <input type='file' hidden accept='.gif,.webp,.png,.jpeg,.jpg,.mp4,.webm' onChange={handleAnimationChange} />
                        </Button>
                        {animationFile && <Typography variant='caption'>{animationFile.name}</Typography>}
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              ) : (
                <>
                  {/* Aperçu du produit - Image et animation séparés des infos */}
                  <Box sx={{ mb: 5 }}>
                    <Typography variant='subtitle1' fontWeight={600} color='text.secondary' sx={{ mb: 2 }}>
                      Aperçu du produit
                    </Typography>
                    <Grid container spacing={4}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>
                          Icône / Image
                        </Typography>
                        <Box
                          sx={{
                            p: 3,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'action.hover',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: 180
                          }}
                        >
                          <Avatar
                            src={product.image_url || undefined}
                            alt={product.name}
                            variant='rounded'
                            sx={{ width: 140, height: 140 }}
                          >
                            {product.name.charAt(0).toUpperCase()}
                          </Avatar>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>
                          Animation
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
                            minHeight: 180
                          }}
                        >
                          {product.animation_url ? (
                            /\.(gif|webp|png|jpe?g)$/i.test(product.animation_url) ? (
                              <img src={product.animation_url} alt='Animation' style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }} />
                            ) : (
                              <video autoPlay loop muted playsInline style={{ maxWidth: '100%', maxHeight: 200 }}><source src={product.animation_url} /></video>
                            )
                          ) : (
                            <Box sx={{ py: 6, textAlign: 'center' }}>
                              <i className='tabler-photo-off' style={{ fontSize: 48, opacity: 0.4 }} />
                              <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>Aucune animation</Typography>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 4 }} />

                  {/* Informations générales - sans icône ni animation */}
                  <Box sx={{ mb: 5 }}>
                    <Typography variant='subtitle1' fontWeight={600} color='text.secondary' sx={{ mb: 2 }}>
                      Informations générales
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>ID</Typography>
                        <Typography variant='body1' fontWeight={500}>{product.id}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>Prix</Typography>
                        <Typography variant='body1' fontWeight={500}>{Number(product.price).toLocaleString('fr-FR')} {product.currency ?? 'XAF'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>Catégorie</Typography>
                        <Typography variant='body1' fontWeight={500}>{product.category ? CATEGORY_LABELS[product.category] ?? product.category : '—'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>Description</Typography>
                        <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap' }}>{product.description || '—'}</Typography>
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
                        <Typography variant='body1'>{product.created_at ? new Date(product.created_at).toLocaleString('fr-FR') : '—'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant='caption' color='text.secondary' display='block' gutterBottom>Dernière modification</Typography>
                        <Typography variant='body1'>{product.updated_at ? new Date(product.updated_at).toLocaleString('fr-FR') : '—'}</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ width: '100%', position: 'sticky', top: 100 }}>
            <CardHeader title='Statut' titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }} />
            <CardContent sx={{ pt: 0 }}>
              <Box display='flex' flexDirection='column' gap={3}>
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
                    Statut actuel
                  </Typography>
                  <Chip
                    label={product.is_active ? 'Actif' : 'Inactif'}
                    color={product.is_active ? 'success' : 'default'}
                    variant='tonal'
                    size='medium'
                  />
                </Box>
                <Button
                  variant='tonal'
                  color={product.is_active ? 'warning' : 'success'}
                  size='medium'
                  fullWidth
                  startIcon={<i className='tabler-toggle-right' />}
                  onClick={handleToggleActive}
                >
                  {product.is_active ? 'Désactiver' : 'Activer'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        message='Êtes-vous sûr de vouloir supprimer ce produit ?'
      />
    </Box>
  )
}
