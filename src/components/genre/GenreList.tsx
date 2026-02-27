'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

// Component Imports
import DeleteConfirmDialog from '@/components/dialogs/DeleteConfirmDialog'
import CustomTextField from '@core/components/mui/TextField'
import OptionMenu from '@core/components/option-menu'
import GenreForm from './GenreForm'

// Hook Imports
import { useGenre } from '@/hooks/useGenre'

// Type Imports
import type { Genre, GenreCreateRequest, GenreUpdateRequest } from '@/types/genre.types'

const GenreList = () => {
  const { genres, loading, error, fetchGenres, createGenre, updateGenre, deleteGenre } = useGenre()
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredGenres, setFilteredGenres] = useState<Genre[]>([])

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false)
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteDialogGenre, setDeleteDialogGenre] = useState<Genre | null>(null)

  // Load genres on mount
  useEffect(() => {
    fetchGenres()
  }, [])

  // Filter genres based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredGenres(genres)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = genres.filter(genre => 
        genre.name.toLowerCase().includes(query) ||
        genre.description?.toLowerCase().includes(query)
      )
      setFilteredGenres(filtered)
    }
  }, [searchQuery, genres])

  const handleOpenCreate = () => {
    setEditingGenre(null)
    setOpenDialog(true)
  }

  const handleOpenEdit = (genre: Genre) => {
    setEditingGenre(genre)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingGenre(null)
  }

  const handleSubmit = async (data: GenreCreateRequest | GenreUpdateRequest) => {
    setSubmitting(true)
    try {
      if (editingGenre) {
        await updateGenre(editingGenre.id, data)
      } else {
        await createGenre(data as GenreCreateRequest)
      }
      handleCloseDialog()
      await fetchGenres()
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRequest = (genre: Genre) => {
    setDeleteDialogGenre(genre)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialogGenre) return
    try {
      await deleteGenre(deleteDialogGenre.id)
      setDeleteDialogGenre(null)
      await fetchGenres()
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  return (
    <Box>
      {/* Search and Actions Card */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          title='Genres musicaux'
          subheader='Gérer les genres musicaux du réseau social'
          action={
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={handleOpenCreate}
            >
              Ajouter un genre
            </Button>
          }
        />
        <CardContent>
          <Box display='flex' gap={2} alignItems='center'>
            <CustomTextField
              fullWidth
              label='Rechercher'
              placeholder='Rechercher par nom ou description'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              variant='tonal'
              color='secondary'
              onClick={handleClearSearch}
              disabled={!searchQuery}
              startIcon={<i className='tabler-x' />}
            >
              Réinitialiser
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity='error' sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Main Content Card */}
      <Card>
        {/* Loading State */}
        {loading && (
          <Box display='flex' justifyContent='center' alignItems='center' minHeight={200} p={4}>
            <CircularProgress />
          </Box>
        )}

        {/* Empty State */}
        {!loading && filteredGenres.length === 0 && (
          <CardContent>
            <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' minHeight={200} gap={2}>
              <i className='tabler-music-off' style={{ fontSize: 48, opacity: 0.5 }} />
              <Typography variant='h6' color='text.secondary'>
                Aucun genre trouvé
              </Typography>
              <Typography variant='body2' color='text.disabled'>
                {searchQuery 
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Ajoutez un nouveau genre pour commencer'
                }
              </Typography>
            </Box>
          </CardContent>
        )}

        {/* Genres Table */}
        {!loading && filteredGenres.length > 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Date de création</TableCell>
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredGenres.map((genre) => (
                  <TableRow key={genre.id} hover>
                    <TableCell>
                      <Chip label={`#${genre.id}`} size='small' variant='tonal' />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' fontWeight={500}>
                        {genre.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' color='text.secondary'>
                        {genre.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' color='text.secondary'>
                        {genre.created_at 
                          ? new Date(genre.created_at).toLocaleDateString('fr-FR')
                          : '-'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <OptionMenu
                        options={[
                          {
                            text: 'Modifier',
                            icon: <i className='tabler-edit' />,
                            menuItemProps: {
                              onClick: () => handleOpenEdit(genre)
                            }
                          },
                          {
                            text: 'Supprimer',
                            icon: <i className='tabler-trash' />,
                            menuItemProps: {
                              onClick: () => handleDeleteRequest(genre),
                              className: 'text-error'
                            }
                          }
                        ]}
                        iconButtonProps={{ size: 'small' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth='sm'
        fullWidth
      >
        <Box display='flex' justifyContent='space-between' alignItems='center' p={2}>
          <Typography variant='h5'>
            {editingGenre ? 'Modifier le genre' : 'Nouveau genre'}
          </Typography>
          <IconButton onClick={handleCloseDialog} size='small'>
            <i className='tabler-x' />
          </IconButton>
        </Box>
        <DialogContent>
          <GenreForm
            genre={editingGenre || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCloseDialog}
            loading={submitting}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialogGenre !== null}
        onClose={() => setDeleteDialogGenre(null)}
        onConfirm={handleDeleteConfirm}
        message={deleteDialogGenre ? `Êtes-vous sûr de vouloir supprimer le genre "${deleteDialogGenre.name}" ?` : ''}
      />
    </Box>
  )
}

export default GenreList
