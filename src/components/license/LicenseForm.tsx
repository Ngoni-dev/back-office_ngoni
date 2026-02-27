'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Type Imports
import type { MusicLicense } from '@/types/license.types'

interface LicenseFormProps {
  license?: MusicLicense
  onSubmit: (data: { music_id: number }) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

/**
 * LicenseForm Component
 * 
 * Note: This form is minimal because licenses are automatically created when music is created.
 * This component is kept for potential future use cases where manual license creation might be needed.
 */
const LicenseForm = ({ license, onSubmit, onCancel, loading }: LicenseFormProps) => {
  const [musicId, setMusicId] = useState<string>(license?.music_id?.toString() || '')
  const [error, setError] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!musicId || isNaN(Number(musicId))) {
      setError('Veuillez entrer un ID de musique valide')
      return
    }

    try {
      await onSubmit({ music_id: Number(musicId) })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    }
  }

  return (
    <Card>
      <CardHeader
        title={license ? 'Modifier la licence' : 'Créer une licence'}
        subheader='Les licences sont généralement créées automatiquement avec les musiques'
      />
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* Info Message */}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'info.lighter',
                  border: '1px solid',
                  borderColor: 'info.light'
                }}
              >
                <Typography variant='body2' color='info.main'>
                  <i className='tabler-info-circle' style={{ marginRight: 8 }} />
                  Les licences sont automatiquement créées lors de la création d'une musique.
                  Utilisez ce formulaire uniquement si vous devez créer une licence manuellement.
                </Typography>
              </Box>
            </Grid>

            {/* Music ID */}
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                type='number'
                label='ID de la musique'
                placeholder='Entrez l\'ID de la musique'
                value={musicId}
                onChange={(e) => setMusicId(e.target.value)}
                error={!!error}
                helperText={error || 'L\'ID de la musique pour laquelle créer une licence'}
                required
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
                  disabled={loading || !musicId}
                  startIcon={loading ? <i className='tabler-loader' /> : <i className='tabler-check' />}
                >
                  {loading ? 'Création...' : license ? 'Mettre à jour' : 'Créer'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default LicenseForm
