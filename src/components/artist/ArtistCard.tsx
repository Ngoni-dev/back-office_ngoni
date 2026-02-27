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
import type { Artist } from '@/types/artist.types'

interface ArtistCardProps {
  artist: Artist
  onEdit?: (artist: Artist) => void
  onDelete?: (artist: Artist) => void
  onVerify?: (artist: Artist) => void
  onView?: (artist: Artist) => void
}

const ArtistCard = ({ artist, onEdit, onDelete, onVerify, onView }: ArtistCardProps) => {
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
    onEdit?.(artist)
  }

  const handleDelete = () => {
    handleMenuClose()
    onDelete?.(artist)
  }

  const handleVerify = () => {
    handleMenuClose()
    onVerify?.(artist)
  }

  const handleView = () => {
    handleMenuClose()
    onView?.(artist)
  }

  return (
    <Card>
      <CardContent>
        <Box display='flex' flexDirection='column' alignItems='center' gap={2}>
          {/* Artist Avatar */}
          <Avatar
            src={artist.profile_image_url}
            alt={artist.name}
            sx={{ width: 80, height: 80 }}
          >
            {!artist.profile_image_url && artist.name.charAt(0).toUpperCase()}
          </Avatar>

          {/* Artist Name with Verified Badge */}
          <Box display='flex' alignItems='center' gap={1}>
            <Typography variant='h6' component='div' textAlign='center'>
              {artist.name}
            </Typography>
            {artist.verified && (
              <Chip
                icon={<i className='tabler-circle-check' />}
                label='Vérifié'
                size='small'
                color='success'
                variant='tonal'
              />
            )}
          </Box>

          {/* Bio */}
          {artist.bio && (
            <Typography
              variant='body2'
              color='text.secondary'
              textAlign='center'
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {artist.bio}
            </Typography>
          )}

          {/* Music Count */}
          {artist.musics && artist.musics.length > 0 && (
            <Box display='flex' alignItems='center' gap={0.5}>
              <i className='tabler-music' style={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant='body2' color='text.secondary'>
                {artist.musics.length} musique{artist.musics.length > 1 ? 's' : ''}
              </Typography>
            </Box>
          )}

          {/* Created Date */}
          {artist.created_at && (
            <Typography variant='caption' color='text.disabled'>
              Créé le: {new Date(artist.created_at).toLocaleDateString('fr-FR')}
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
          {onVerify && !artist.verified && (
            <MenuItem onClick={handleVerify}>
              <i className='tabler-circle-check' style={{ marginRight: 8 }} />
              Vérifier l'artiste
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

export default ArtistCard
