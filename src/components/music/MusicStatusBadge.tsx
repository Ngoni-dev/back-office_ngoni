'use client'

import StatusBadge from '@/components/StatusBadge'

// Type Imports
import type { MusicStatus } from '@/types/music.types'

interface MusicStatusBadgeProps {
  status: MusicStatus
}

const statusConfig: Record<MusicStatus, { label: string; tone: 'neutral' | 'success' | 'error' | 'warning' }> = {
  pending: { label: 'En attente', tone: 'warning' },
  approved: { label: 'Approuvé', tone: 'success' },
  rejected: { label: 'Rejeté', tone: 'error' },
  blocked: { label: 'Bloqué', tone: 'neutral' }
}

const MusicStatusBadge = ({ status }: MusicStatusBadgeProps) => {
  const config = statusConfig[status]

  return <StatusBadge label={config.label} tone={config.tone} />
}

export default MusicStatusBadge
