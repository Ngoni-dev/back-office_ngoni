'use client'

import { toast } from 'react-toastify'
// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'

// Style Imports (comme Music / Artist)
import tableStyles from '@core/styles/table.module.css'

// Service Imports
import { genreService } from '@/services/genre.service'

// Type Imports
import type { Genre } from '@/types/genre.types'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Component Imports
import DeleteConfirmDialog from '@/components/dialogs/DeleteConfirmDialog'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import { useDebounceValue } from '@/hooks/useDebounceValue'

export default function GenreList() {
  const router = useRouter()
  const { lang } = useParams()
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)
  const [searchName, setSearchName] = useState('')
  const debouncedSearchName = useDebounceValue(searchName, 400)
  const [deleteDialog, setDeleteDialog] = useState<number | null>(null)

  const fetchGenres = async () => {
    setLoading(true)
    try {
      if (debouncedSearchName.trim()) {
        const response = await genreService.list(1, 500)
        const all = response.data ?? []
        const filtered = all.filter(
          g =>
            g.name.toLowerCase().includes(debouncedSearchName.trim().toLowerCase()) ||
            g.description?.toLowerCase().includes(debouncedSearchName.trim().toLowerCase())
        )
        setGenres(filtered)
        setTotal(filtered.length)
      } else {
        const response = await genreService.list(page + 1, perPage)
        setGenres(response.data ?? [])
        const meta = response.pagination ?? response.meta
        setTotal(meta?.total ?? response.data?.length ?? 0)
      }
    } catch {
      setGenres([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(0)
  }, [debouncedSearchName])

  useEffect(() => {
    fetchGenres()
  }, [page, perPage, debouncedSearchName])

  const handlePageChange = (_: unknown, newPage: number) => setPage(newPage)
  const handlePerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPerPage(parseInt(e.target.value, 10))
    setPage(0)
  }

  const resetFilters = () => {
    setSearchName('')
    setPage(0)
  }

  const handleDelete = async (id: number) => {
    try {
      await genreService.delete(id)
      toast.success('Genre supprimé')
      setDeleteDialog(null)
      fetchGenres()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const displayedGenres = debouncedSearchName.trim()
    ? genres.slice(page * perPage, page * perPage + perPage)
    : genres

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs items={[{ label: 'Genres' }]} />
      <Grid container spacing={6} sx={{ width: '100%' }}>
        <Grid size={{ xs: 12 }} sx={{ minWidth: 0, width: '100%', maxWidth: '100%' }}>
          <Card sx={{ width: '100%', maxWidth: '100%' }}>
            <CardHeader
              title='Genres'
              action={
                <Button
                  variant='contained'
                  startIcon={<i className='tabler-plus' />}
                  onClick={() => router.push(getLocalizedUrl('/apps/ngoni/genres/new', lang as string))}
                >
                  Ajouter
                </Button>
              }
            />
            <div className='flex flex-wrap items-end justify-between gap-4 p-6 border-bs'>
              <div className='flex flex-wrap items-end gap-4'>
                <CustomTextField
                  size='small'
                  placeholder='Rechercher par nom ou description'
                  value={searchName}
                  onChange={e => setSearchName(e.target.value)}
                  sx={{ minWidth: 260 }}
                />
                <Button
                  variant='outlined'
                  color='secondary'
                  size='small'
                  onClick={resetFilters}
                  sx={{ minHeight: 40, textTransform: 'none' }}
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
            {loading ? (
              <Box display='flex' justifyContent='center' alignItems='center' minHeight={280}>
                <CircularProgress />
              </Box>
            ) : genres.length === 0 ? (
              <Box
                display='flex'
                flexDirection='column'
                alignItems='center'
                justifyContent='center'
                minHeight={200}
                gap={2}
                className='p-6'
              >
                <i className='tabler-music-off text-5xl text-textDisabled' />
                <Typography variant='body1' color='text.secondary'>
                  Aucun genre trouvé
                </Typography>
                <Button
                  variant='tonal'
                  startIcon={<i className='tabler-plus' />}
                  onClick={() => router.push(getLocalizedUrl('/apps/ngoni/genres/new', lang as string))}
                >
                  Ajouter un genre
                </Button>
              </Box>
            ) : (
              <>
                <div className='overflow-x-auto' style={{ width: '100%' }}>
                  <table className={tableStyles.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Description</th>
                        <th>Date de création</th>
                        <th align='right'>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedGenres.map(g => (
                        <tr key={g.id}>
                          <td>{g.id}</td>
                          <td>
                            <Button
                              variant='text'
                              color='primary'
                              size='small'
                              sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
                              onClick={() =>
                                router.push(getLocalizedUrl(`/apps/ngoni/genres/${g.id}`, lang as string))
                              }
                            >
                              {g.name}
                            </Button>
                          </td>
                          <td>
                            {g.description
                              ? g.description.length > 60
                                ? `${g.description.substring(0, 60)}...`
                                : g.description
                              : '—'}
                          </td>
                          <td>
                            {g.created_at
                              ? new Date(g.created_at).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })
                              : '—'}
                          </td>
                          <td align='right'>
                            <OptionMenu
                              options={[
                                {
                                  text: 'Détails',
                                  icon: <i className='tabler-eye' />,
                                  menuItemProps: {
                                    onClick: () =>
                                      router.push(getLocalizedUrl(`/apps/ngoni/genres/${g.id}`, lang as string))
                                  }
                                },
                                {
                                  text: 'Modifier',
                                  icon: <i className='tabler-edit' />,
                                  menuItemProps: {
                                    onClick: () =>
                                      router.push(getLocalizedUrl(`/apps/ngoni/genres/${g.id}`, lang as string))
                                  }
                                },
                                { divider: true },
                                {
                                  text: 'Supprimer',
                                  icon: <i className='tabler-trash' />,
                                  menuItemProps: {
                                    onClick: () => setDeleteDialog(g.id),
                                    className: 'text-error'
                                  }
                                }
                              ]}
                              iconButtonProps={{ size: 'small' }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  component='div'
                  count={total}
                  page={page}
                  onPageChange={handlePageChange}
                  rowsPerPage={perPage}
                  onRowsPerPageChange={handlePerPageChange}
                  rowsPerPageOptions={[10, 15, 25, 50]}
                  labelRowsPerPage='Lignes par page'
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
                />
              </>
            )}
          </Card>
        </Grid>
      </Grid>
      <DeleteConfirmDialog
        open={deleteDialog !== null}
        onClose={() => setDeleteDialog(null)}
        onConfirm={async () => { if (deleteDialog !== null) await handleDelete(deleteDialog) }}
        message='Êtes-vous sûr de vouloir supprimer ce genre ?'
      />
    </Box>
  )
}
