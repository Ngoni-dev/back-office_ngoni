'use client'

import { toast } from 'react-toastify'
// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'

// Style Imports (comme template-back-office_ngoni)
import tableStyles from '@core/styles/table.module.css'

// Service Imports
import { musicService } from '@/services/music.service'

// Type Imports
import type { Music, MusicStatus } from '@/types/music.types'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Component Imports
import DeleteConfirmDialog from '@/components/dialogs/DeleteConfirmDialog'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import ArtistAvatarsCell from '@/components/ngoni/ArtistAvatarsCell'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import { useDebounceValue } from '@/hooks/useDebounceValue'

const statusColors: Record<MusicStatus, 'default' | 'success' | 'error' | 'warning'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  blocked: 'default'
}

const statusLabels: Record<MusicStatus, string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Rejeté',
  blocked: 'Bloqué'
}

function formatDuration(seconds?: number, formatted?: string): string {
  if (formatted) return formatted
  if (seconds == null) return '-'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function MusicList() {
  const router = useRouter()
  const { lang } = useParams()
  const [musics, setMusics] = useState<Music[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)
  const [searchTitle, setSearchTitle] = useState('')
  const debouncedSearchTitle = useDebounceValue(searchTitle, 400)
  const [searchStatus, setSearchStatus] = useState<MusicStatus | ''>('')
  const [deleteDialog, setDeleteDialog] = useState<number | null>(null)

  const fetchMusics = async () => {
    setLoading(true)
    try {
      let response
      if (debouncedSearchTitle || searchStatus) {
        response = await musicService.search({
          title: debouncedSearchTitle || undefined,
          status: searchStatus || undefined,
          page: page + 1,
          per_page: perPage
        })
      } else {
        response = await musicService.list(page + 1, perPage)
      }
      setMusics(response.data ?? [])
      const pagination = response.pagination ?? response.meta
      setTotal(pagination?.total ?? response.data?.length ?? 0)
    } catch {
      setMusics([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(0)
  }, [debouncedSearchTitle, searchStatus])

  useEffect(() => {
    fetchMusics()
  }, [page, perPage, debouncedSearchTitle, searchStatus])

  const handlePageChange = (_: unknown, newPage: number) => setPage(newPage)
  const handlePerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPerPage(parseInt(e.target.value, 10))
    setPage(0)
  }

  const handleDelete = async (id: number) => {
    try {
      await musicService.delete(id)
      toast.success('Musique supprimée')
      fetchMusics()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleStatusChange = async (id: number, status: MusicStatus) => {
    try {
      await musicService.updateStatus(id, status)
      toast.success('Statut mis à jour')
      fetchMusics()
    } catch {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs items={[{ label: 'Music' }]} />
      <Grid container spacing={6} sx={{ width: '100%' }}>
        <Grid size={{ xs: 12 }} sx={{ minWidth: 0, width: '100%', maxWidth: '100%' }}>
          <Card sx={{ width: '100%', maxWidth: '100%' }}>
            <CardHeader
              title='Musiques'
              action={
                <Button
                  variant='contained'
                  startIcon={<i className='tabler-plus' />}
                  onClick={() => router.push(getLocalizedUrl('/apps/ngoni/music/new', lang as string))}
                >
                  Ajouter
                </Button>
              }
            />
            {/* Filtres - même structure que template UserListTable (p-6 border-bs) */}
            <div className='flex flex-wrap items-end justify-between gap-4 p-6 border-bs'>
              <div className='flex flex-wrap items-end gap-4'>
                <CustomTextField
                  size='small'
                  placeholder='Rechercher par titre'
                  value={searchTitle}
                  onChange={e => setSearchTitle(e.target.value)}
                  sx={{ minWidth: 220 }}
                />
                <CustomTextField
                  select
                  size='small'
                  label='Statut'
                  value={searchStatus}
                  onChange={e => setSearchStatus(e.target.value as MusicStatus | '')}
                  sx={{ minWidth: 160 }}
                >
                  <MenuItem value=''>Tous</MenuItem>
                  <MenuItem value='pending'>En attente</MenuItem>
                  <MenuItem value='approved'>Approuvé</MenuItem>
                  <MenuItem value='rejected'>Rejeté</MenuItem>
                  <MenuItem value='blocked'>Bloqué</MenuItem>
                </CustomTextField>
              </div>
            </div>
            {loading ? (
              <Box display='flex' justifyContent='center' alignItems='center' minHeight={280}>
                <CircularProgress />
              </Box>
            ) : musics.length === 0 ? (
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
                  Aucune musique trouvée
                </Typography>
                <Button
                  variant='tonal'
                  startIcon={<i className='tabler-plus' />}
                  onClick={() => router.push(getLocalizedUrl('/apps/ngoni/music/new', lang as string))}
                >
                  Ajouter une musique
                </Button>
              </Box>
            ) : (
              <>
                <div className='overflow-x-auto' style={{ width: '100%' }}>
                  <table className={tableStyles.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Titre</th>
                        <th>Durée</th>
                        <th>Statut</th>
                        <th>Artistes</th>
                        <th align='right'>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {musics.map(m => (
                        <tr key={m.id}>
                          <td>{m.id}</td>
                          <td>
                            <Button
                              variant='text'
                              color='primary'
                              size='small'
                              sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
                              onClick={() =>
                                router.push(getLocalizedUrl(`/apps/ngoni/music/${m.id}`, lang as string))
                              }
                            >
                              {m.title}
                            </Button>
                          </td>
                          <td>{formatDuration(m.duration, m.duration_formatted)}</td>
                          <td>
                            <Chip
                              label={statusLabels[m.status] ?? m.status}
                              variant='tonal'
                              color={statusColors[m.status] ?? 'default'}
                              size='small'
                            />
                          </td>
                          <td>
                            <ArtistAvatarsCell artists={m.artists} size='compact' />
                          </td>
                          <td align='right'>
                            <OptionMenu
                              options={[
                                {
                                  text: 'Détails',
                                  icon: <i className='tabler-eye' />,
                                  menuItemProps: {
                                    onClick: () =>
                                      router.push(getLocalizedUrl(`/apps/ngoni/music/${m.id}`, lang as string))
                                  }
                                },
                                {
                                  text: 'Modifier',
                                  icon: <i className='tabler-edit' />,
                                  menuItemProps: {
                                    onClick: () =>
                                      router.push(getLocalizedUrl(`/apps/ngoni/music/${m.id}`, lang as string))
                                  }
                                },
                                { divider: true },
                                {
                                  text: 'Approuver',
                                  icon: <i className='tabler-check' />,
                                  menuItemProps: {
                                    onClick: () => handleStatusChange(m.id, 'approved'),
                                    disabled: m.status === 'approved'
                                  }
                                },
                                {
                                  text: 'Rejeter',
                                  icon: <i className='tabler-x' />,
                                  menuItemProps: {
                                    onClick: () => handleStatusChange(m.id, 'rejected'),
                                    disabled: m.status === 'rejected'
                                  }
                                },
                                {
                                  text: 'En attente',
                                  icon: <i className='tabler-clock' />,
                                  menuItemProps: {
                                    onClick: () => handleStatusChange(m.id, 'pending'),
                                    disabled: m.status === 'pending'
                                  }
                                },
                                {
                                  text: 'Bloquer',
                                  icon: <i className='tabler-lock' />,
                                  menuItemProps: {
                                    onClick: () => handleStatusChange(m.id, 'blocked'),
                                    disabled: m.status === 'blocked'
                                  }
                                },
                                { divider: true },
                                {
                                  text: 'Supprimer',
                                  icon: <i className='tabler-trash' />,
                                  menuItemProps: {
                                    onClick: () => setDeleteDialog(m.id),
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
        message='Êtes-vous sûr de vouloir supprimer cette musique ?'
      />
    </Box>
  )
}
