'use client'

// MUI Imports
import Chip from '@mui/material/Chip'

// Type Imports
import type { MusicStatus } from '@/types/music.types'

interface MusicStatusBadgeProps {
  status: MusicStatus
}

const statusConfig: Record<MusicStatus, { label: string; color: 'default' | 'primary' | 'success' | 'error' | 'warning' }> = {
  pending: { label: 'En attente', color: 'warning' },
  approved: { label: 'Approuvé', color: 'success' },
  rejected: { label: 'Rejeté', color: 'error' },
  blocked: { label: 'Bloqué', color: 'default' }
}

const MusicStatusBadge = ({ status }: MusicStatusBadgeProps) => {
  const config = statusConfig[status]

  return (
    <Chip
      label={config.label}
      color={config.color}
      size='small'
      variant='tonal'
    />
  )
}

export default MusicStatusBadge
