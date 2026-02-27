'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
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

// Component Imports
import MusicStatusBadge from './MusicStatusBadge'

// Type Imports
import type { Music } from '@/types/music.types'

interface MusicCardProps {
  music: Music
  onEdit?: (music: Music) => void
  onDelete?: (music: Music) => void
  onStatusChange?: (music: Music) => void
  onView?: (music: Music) => void
}

const MusicCard = ({ music, onEdit, onDelete, onStatusChange, onView }: MusicCardProps) => {
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
    onEdit?.(music)
  }

  const handleDelete = () => {
    handleMenuClose()
    onDelete?.(music)
  }

  const handleStatusChange = () => {
    handleMenuClose()
    onStatusChange?.(music)
  }

  const handleView = () => {
    handleMenuClose()
    onView?.(music)
  }

  return (
    <Card>
      <CardContent>
        <Box display='flex' justifyContent='space-between' alignItems='flex-start' mb={2}>
          <Typography variant='h6' component='div' sx={{ flex: 1 }}>
            {music.title}
          </Typography>
          <MusicStatusBadge status={music.status} />
        </Box>

        <Box display='flex' flexDirection='column' gap={1}>
          {music.duration_formatted && (
            <Typography variant='body2' color='text.secondary'>
              <i className='tabler-clock' style={{ marginRight: 4 }} />
              Durée: {music.duration_formatted}
            </Typography>
          )}

          {music.artists && music.artists.length > 0 && (
            <Box display='flex' alignItems='center' gap={0.5} flexWrap='wrap'>
              <i className='tabler-microphone' style={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant='body2' color='text.secondary'>
                Artistes:
              </Typography>
              {music.artists.map((artist, index) => (
                <Chip
                  key={artist.id}
                  label={artist.name}
                  size='small'
                  variant='outlined'
                  icon={artist.verified ? <i className='tabler-circle-check' /> : undefined}
                />
              ))}
            </Box>
          )}

          {music.genres && music.genres.length > 0 && (
            <Box display='flex' alignItems='center' gap={0.5} flexWrap='wrap'>
              <i className='tabler-music' style={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant='body2' color='text.secondary'>
                Genres:
              </Typography>
              {music.genres.map((genre) => (
                <Chip
                  key={genre.id}
                  label={genre.name}
                  size='small'
                  variant='outlined'
                />
              ))}
            </Box>
          )}

          {music.uploader && (
            <Typography variant='body2' color='text.secondary'>
              <i className='tabler-user' style={{ marginRight: 4 }} />
              Uploadé par: {music.uploader.name}
            </Typography>
          )}

          {music.created_at && (
            <Typography variant='caption' color='text.disabled'>
              Créé le: {new Date(music.created_at).toLocaleDateString('fr-FR')}
            </Typography>
          )}
        </Box>
      </CardContent>

      <Divider />

      <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
        <Box display='flex' gap={1}>
          {music.likes_count !== undefined && (
            <Chip
              icon={<i className='tabler-heart' />}
              label={music.likes_count}
              size='small'
              variant='outlined'
            />
          )}
          {music.usage_count !== undefined && (
            <Chip
              icon={<i className='tabler-player-play' />}
              label={music.usage_count}
              size='small'
              variant='outlined'
            />
          )}
        </Box>

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
          {onStatusChange && (
            <MenuItem onClick={handleStatusChange}>
              <i className='tabler-refresh' style={{ marginRight: 8 }} />
              Changer le statut
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

export default MusicCard
