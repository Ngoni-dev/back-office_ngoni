'use client'

// React Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'

// Type Imports
import type { MusicArtist } from '@/types/music.types'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

interface ArtistAvatarsCellProps {
  artists?: MusicArtist[]
  size?: 'compact' | 'default'
  /** If not provided, defaults to navigating to artist detail page */
  onArtistClick?: (artistId: number) => void
}

const avatarSizes = {
  compact: 32,
  default: 40
}

const borderColors = [
  'var(--mui-palette-primary-main)',
  'var(--mui-palette-secondary-main)',
  'var(--mui-palette-info-main)',
  'var(--mui-palette-success-main)',
  'var(--mui-palette-warning-main)'
]

export default function ArtistAvatarsCell({ artists, size = 'compact', onArtistClick }: ArtistAvatarsCellProps) {
  const router = useRouter()
  const { lang } = useParams()
  const avatarSize = avatarSizes[size]

  if (!artists?.length) {
    return <Box component='span' sx={{ color: 'text.secondary' }}>—</Box>
  }

  const handleClick = (artistId: number) => {
    if (onArtistClick) {
      onArtistClick(artistId)
    } else {
      router.push(getLocalizedUrl(`/apps/ngoni/artists/${artistId}`, lang as string))
    }
  }

  return (
    <Box
      component='span'
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'compact' ? 0.5 : 1,
        flexWrap: 'wrap'
      }}
    >
      {artists.map((artist, index) => {
        const borderColor = borderColors[index % borderColors.length]
        return (
          <Tooltip key={artist.id} title={artist.name} placement='top'>
            <Box
              component='span'
              onClick={e => {
                e.stopPropagation()
                handleClick(artist.id)
              }}
              role='button'
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleClick(artist.id)
                }
              }}
              sx={{
                display: 'inline-flex',
                cursor: 'pointer',
                borderRadius: '50%',
                border: '2px solid',
                borderColor,
                padding: '2px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'scale(1.05)', boxShadow: 2 },
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: 2
                }
              }}
            >
              <Badge
                overlap='circular'
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Box
                    component='span'
                    title={(artist.verified ?? false) ? 'Vérifié' : 'Non vérifié'}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: size === 'compact' ? 12 : 14,
                      height: size === 'compact' ? 12 : 14,
                      borderRadius: '50%',
                      bgcolor: (artist.verified ?? false) ? '#1DA1F2' : 'action.disabledBackground',
                      color: (artist.verified ?? false) ? 'white' : 'text.disabled',
                      border: '2px solid',
                      borderColor: 'background.paper',
                      flexShrink: 0
                    }}
                  >
                    {(artist.verified ?? false) ? (
                      <svg width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round'>
                        <polyline points='20 6 9 17 4 12' />
                      </svg>
                    ) : (
                      <i className='tabler-minus' style={{ fontSize: 8 }} />
                    )}
                  </Box>
                }
              >
                <Avatar
                  src={artist.profile_image_url || undefined}
                  alt={artist.name}
                  sx={{
                    width: avatarSize,
                    height: avatarSize,
                    fontSize: avatarSize * 0.45
                  }}
                >
                  {artist.name.charAt(0).toUpperCase()}
                </Avatar>
              </Badge>
            </Box>
          </Tooltip>
        )
      })}
    </Box>
  )
}
