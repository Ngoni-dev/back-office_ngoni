'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Hook Imports
import { useLicense } from '@/hooks/useLicense'

// Type Imports
import type { MusicLicense, RegionRestriction } from '@/types/license.types'

interface RestrictionManagerProps {
  license: MusicLicense
  onClose?: () => void
}

const RestrictionManager = ({ license, onClose }: RestrictionManagerProps) => {
  const { addRestriction, removeRestriction, loading } = useLicense()
  
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [countryId, setCountryId] = useState<string>('')
  const [restrictionType, setRestrictionType] = useState<string>('blocked')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [restrictionToDelete, setRestrictionToDelete] = useState<RegionRestriction | null>(null)

  const handleAddRestriction = async () => {
    if (!countryId || isNaN(Number(countryId))) {
      return
    }

    try {
      await addRestriction(license.id, {
        country_id: Number(countryId),
        restriction_type: restrictionType
      })
      setAddDialogOpen(false)
      setCountryId('')
      setRestrictionType('blocked')
    } catch (error) {
      console.error('Error adding restriction:', error)
    }
  }

  const handleDeleteClick = (restriction: RegionRestriction) => {
    setRestrictionToDelete(restriction)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!restrictionToDelete) return

    try {
      await removeRestriction(license.id, restrictionToDelete.id)
      setDeleteConfirmOpen(false)
      setRestrictionToDelete(null)
    } catch (error) {
      console.error('Error removing restriction:', error)
    }
  }

  const restrictions = license.regionRestrictions || []

  return (
    <>
      <Card>
        <CardHeader
          title={`Restrictions régionales - Licence #${license.id}`}
          subheader={license.music_id ? `Musique #${license.music_id}` : 'Aucune musique associée'}
          action={
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => setAddDialogOpen(true)}
              disabled={loading}
            >
              Ajouter une restriction
            </Button>
          }
        />
        <CardContent>
          {restrictions.length === 0 ? (
            <Box
              display='flex'
              flexDirection='column'
              alignItems='center'
              justifyContent='center'
              minHeight={200}
              gap={2}
            >
              <i className='tabler-world-off' style={{ fontSize: 48, opacity: 0.5 }} />
              <Typography variant='h6' color='text.secondary'>
                Aucune restriction régionale
              </Typography>
              <Typography variant='body2' color='text.disabled'>
                Cette licence n'a pas de restrictions géographiques
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID Restriction</TableCell>
                    <TableCell>ID Pays</TableCell>
                    <TableCell>Type de restriction</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {restrictions.map((restriction) => (
                    <TableRow key={restriction.id}>
                      <TableCell>
                        <Typography variant='body2' fontWeight={500}>
                          #{restriction.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`Pays #${restriction.country_id}`}
                          size='small'
                          variant='tonal'
                          color='primary'
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={restriction.restriction_type}
                          size='small'
                          variant='outlined'
                          color={restriction.restriction_type === 'blocked' ? 'error' : 'warning'}
                        />
                      </TableCell>
                      <TableCell align='right'>
                        <IconButton
                          size='small'
                          color='error'
                          onClick={() => handleDeleteClick(restriction)}
                          disabled={loading}
                        >
                          <i className='tabler-trash' />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {onClose && (
            <Box mt={3} display='flex' justifyContent='flex-end'>
              <Button variant='tonal' onClick={onClose}>
                Fermer
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add Restriction Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Ajouter une restriction régionale</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                type='number'
                label='ID du pays'
                placeholder={"Entrez l'ID du pays"}
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
                helperText={"L'identifiant numérique du pays à restreindre"}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Type de restriction</InputLabel>
                <Select
                  value={restrictionType}
                  label='Type de restriction'
                  onChange={(e) => setRestrictionType(e.target.value)}
                >
                  <MenuItem value='blocked'>Bloqué</MenuItem>
                  <MenuItem value='limited'>Limité</MenuItem>
                  <MenuItem value='restricted'>Restreint</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            variant='tonal'
            color='secondary'
            onClick={() => setAddDialogOpen(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            variant='contained'
            onClick={handleAddRestriction}
            disabled={loading || !countryId}
            startIcon={loading ? <i className='tabler-loader' /> : <i className='tabler-check' />}
          >
            {loading ? 'Ajout...' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer cette restriction régionale ?
          </Typography>
          {restrictionToDelete && (
            <Box mt={2}>
              <Typography variant='body2' color='text.secondary'>
                Pays #{restrictionToDelete.country_id} - {restrictionToDelete.restriction_type}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant='tonal'
            color='secondary'
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            variant='contained'
            color='error'
            onClick={handleConfirmDelete}
            disabled={loading}
            startIcon={loading ? <i className='tabler-loader' /> : <i className='tabler-trash' />}
          >
            {loading ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default RestrictionManager
