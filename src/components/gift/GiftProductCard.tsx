'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// Type Imports
import type { GiftProduct } from '@/types/gift.types'

interface GiftProductCardProps {
  product: GiftProduct
  onEdit?: (product: GiftProduct) => void
  onDelete?: (product: GiftProduct) => void
  onToggleActive?: (product: GiftProduct) => void
  onView?: (product: GiftProduct) => void
}

const GiftProductCard = ({ product, onEdit, onDelete, onToggleActive, onView }: GiftProductCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleEdit = () => {
    handleMenuClose()
    onEdit?.(product)
  }

  const handleDelete = () => {
    handleMenuClose()
    onDelete?.(product)
  }

  const handleToggleActive = () => {
    handleMenuClose()
    onToggleActive?.(product)
  }

  const handleView = () => {
    handleMenuClose()
    onView?.(product)
  }

  return (
    <Card>
      <CardContent>
        <Box display='flex' flexDirection='column' alignItems='center' gap={2}>
          {/* Product Image */}
          <Avatar
            src={product.image_url}
            alt={product.name}
            variant='rounded'
            sx={{ width: 100, height: 100 }}
          >
            {!product.image_url && product.name.charAt(0).toUpperCase()}
          </Avatar>

          {/* Product Name with Active Status */}
          <Box display='flex' flexDirection='column' alignItems='center' gap={1} width='100%'>
            <Typography variant='h6' component='div' textAlign='center'>
              {product.name}
            </Typography>
            <Chip
              label={product.is_active ? 'Actif' : 'Inactif'}
              size='small'
              color={product.is_active ? 'success' : 'default'}
              variant='tonal'
            />
          </Box>

          {/* Description */}
          {product.description && (
            <Typography
              variant='body2'
              color='text.secondary'
              textAlign='center'
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {product.description}
            </Typography>
          )}

          {/* Price */}
          <Box display='flex' alignItems='center' gap={1}>
            <i className='tabler-coin' style={{ fontSize: 20, color: 'primary.main' }} />
            <Typography variant='h6' color='primary'>
              {product.price} {product.currency || 'XAF'}
            </Typography>
          </Box>

          {/* Animation Indicator */}
          {product.animation_url && (
            <Box display='flex' alignItems='center' gap={0.5}>
              <i className='tabler-movie' style={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant='caption' color='text.secondary'>
                Animation disponible
              </Typography>
            </Box>
          )}

          {/* Created Date */}
          {product.created_at && (
            <Typography variant='caption' color='text.disabled'>
              Créé le: {new Date(product.created_at).toLocaleDateString('fr-FR')}
            </Typography>
          )}
        </Box>
      </CardContent>

      <Divider />

      <CardActions sx={{ justifyContent: 'flex-end', px: 2 }}>
        <IconButton size='small' onClick={handleMenuClick}>
          <i className='tabler-dots-vertical' />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {onView && (
            <MenuItem onClick={handleView}>
              <i className='tabler-eye' style={{ marginRight: 8 }} />
              Voir les détails
            </MenuItem>
          )}
          {onEdit && (
            <MenuItem onClick={handleEdit}>
              <i className='tabler-edit' style={{ marginRight: 8 }} />
              Modifier
            </MenuItem>
          )}
          {onToggleActive && (
            <MenuItem onClick={handleToggleActive}>
              <i className={product.is_active ? 'tabler-eye-off' : 'tabler-eye'} style={{ marginRight: 8 }} />
              {product.is_active ? 'Désactiver' : 'Activer'}
            </MenuItem>
          )}
          {onDelete && (
            <>
              <Divider />
              <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                <i className='tabler-trash' style={{ marginRight: 8 }} />
                Supprimer
              </MenuItem>
            </>
          )}
        </Menu>
      </CardActions>
    </Card>
  )
}

export default GiftProductCard
