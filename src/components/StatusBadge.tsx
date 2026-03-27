'use client'

/**
 * Badge de statut aligné sur le thème template (Chip `variant="tonal"` — fond léger, texte contrasté).
 * @see template-back-office_ngoni/src/@core/theme/overrides/chip.ts
 */
import Chip from '@mui/material/Chip'
import type { ChipProps } from '@mui/material/Chip'

export type StatusBadgeTone = 'success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary' | 'neutral'

export type StatusBadgeProps = Omit<ChipProps, 'variant' | 'size' | 'color'> & {
  /** Couleur sémantique douce (tonal) ou neutre grisé. */
  tone?: StatusBadgeTone
}

export default function StatusBadge({ tone = 'neutral', label, sx, ...rest }: StatusBadgeProps) {
  if (tone === 'neutral') {
    return (
      <Chip
        size='small'
        variant='filled'
        label={label}
        sx={[
          theme => ({
            bgcolor: theme.palette.action.hover,
            color: 'text.secondary',
            fontWeight: 500,
            border: 'none'
          }),
          ...(sx ? (Array.isArray(sx) ? sx : [sx]) : [])
        ]}
        {...rest}
      />
    )
  }

  return (
    <Chip
      size='small'
      variant='tonal'
      color={tone}
      label={label}
      sx={sx}
      {...rest}
    />
  )
}

/** Map les anciennes couleurs MUI Chip (`default` = neutre). */
export function toneFromLegacyChipColor(
  c: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | undefined
): StatusBadgeTone {
  if (!c || c === 'default') return 'neutral'
  return c
}
