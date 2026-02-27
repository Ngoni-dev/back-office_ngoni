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
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Service Imports
import { licenseService } from '@/services/license.service'

// Type Imports
import type { MusicLicense } from '@/types/license.types'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Component Imports
import DeleteConfirmDialog from '@/components/dialogs/DeleteConfirmDialog'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import { useDebounceValue } from '@/hooks/useDebounceValue'

export default function LicenseList() {
  const router = useRouter()
  const { lang } = useParams()
  const [licenses, setLicenses] = useState<MusicLicense[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounceValue(searchQuery, 400)
  const [deleteDialog, setDeleteDialog] = useState<number | null>(null)

  const fetchLicenses = async () => {
    setLoading(true)
    try {
      if (debouncedSearchQuery.trim()) {
        const response = await licenseService.list(1, 500)
        const all = response.data ?? []
        const q = debouncedSearchQuery.trim().toLowerCase()
        const filtered = all.filter(
          l =>
            l.owner_name?.toLowerCase().includes(q) ||
            l.license_type?.toLowerCase().includes(q) ||
            String(l.music_id).includes(q) ||
            l.music?.title?.toLowerCase().includes(q)
        )
        setLicenses(filtered)
        setTotal(filtered.length)
      } else {
        const response = await licenseService.list(page + 1, perPage)
        setLicenses(response.data ?? [])
        const meta = response.meta
        setTotal(meta?.total ?? response.data?.length ?? 0)
      }
    } catch {
      setLicenses([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(0)
  }, [debouncedSearchQuery])

  useEffect(() => {
    fetchLicenses()
  }, [page, perPage, debouncedSearchQuery])

  const handlePageChange = (_: unknown, newPage: number) => setPage(newPage)
  const handlePerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPerPage(parseInt(e.target.value, 10))
    setPage(0)
  }

  const handleDelete = async (id: number) => {
    try {
      await licenseService.delete(id)
      toast.success('Licence supprimée')
      setDeleteDialog(null)
      fetchLicenses()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const restrictions = (l: MusicLicense) => l.regionRestrictions ?? l.region_restrictions ?? []

  const displayedLicenses = debouncedSearchQuery.trim()
    ? licenses.slice(page * perPage, page * perPage + perPage)
    : licenses

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs items={[{ label: 'Licences' }]} />
      <Grid container spacing={6} sx={{ width: '100%' }}>
        <Grid size={{ xs: 12 }} sx={{ minWidth: 0, width: '100%', maxWidth: '100%' }}>
          <Card sx={{ width: '100%', maxWidth: '100%' }}>
            <CardHeader
              title='Licences'
              action={
                <Button
                  variant='contained'
                  startIcon={<i className='tabler-plus' />}
                  onClick={() => router.push(getLocalizedUrl('/apps/ngoni/licenses/new', lang as string))}
                >
                  Ajouter
                </Button>
              }
            />
            <div className='flex flex-wrap items-end justify-between gap-4 p-6 border-bs'>
              <div className='flex flex-wrap items-end gap-4'>
                <CustomTextField
                  size='small'
                  placeholder='Rechercher (propriétaire, type, musique)'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  sx={{ minWidth: 280 }}
                />
              </div>
            </div>
            {loading ? (
              <Box display='flex' justifyContent='center' alignItems='center' minHeight={280}>
                <CircularProgress />
              </Box>
            ) : licenses.length === 0 ? (
              <Box
                display='flex'
                flexDirection='column'
                alignItems='center'
                justifyContent='center'
                minHeight={200}
                gap={2}
                className='p-6'
              >
                <i className='tabler-license-off text-5xl text-textDisabled' />
                <Typography variant='body1' color='text.secondary'>
                  Aucune licence trouvée
                </Typography>
                <Button
                  variant='tonal'
                  startIcon={<i className='tabler-plus' />}
                  onClick={() => router.push(getLocalizedUrl('/apps/ngoni/licenses/new', lang as string))}
                >
                  Ajouter une licence
                </Button>
              </Box>
            ) : (
              <>
                <div className='overflow-x-auto' style={{ width: '100%' }}>
                  <table className={tableStyles.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Musique</th>
                        <th>Propriétaire</th>
                        <th>Type</th>
                        <th>Début / Fin</th>
                        <th>Statut</th>
                        <th>Restrictions</th>
                        <th align='right'>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedLicenses.map(l => (
                        <tr key={l.id}>
                          <td>{l.id}</td>
                          <td>
                            <Button
                              variant='text'
                              color='primary'
                              size='small'
                              sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
                              onClick={() =>
                                router.push(getLocalizedUrl(`/apps/ngoni/licenses/${l.id}`, lang as string))
                              }
                            >
                              {l.music?.title ?? `Musique #${l.music_id}`}
                            </Button>
                          </td>
                          <td>{l.owner_name ?? '—'}</td>
                          <td>{l.license_type ?? '—'}</td>
                          <td>
                            {l.start_date
                              ? new Date(l.start_date).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })
                              : '—'}
                            {' → '}
                            {l.end_date
                              ? new Date(l.end_date).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })
                              : 'Illimitée'}
                          </td>
                          <td>
                            {l.is_expired ? (
                              <Chip label='Expirée' size='small' color='error' variant='tonal' />
                            ) : l.is_active ? (
                              <Chip label='Active' size='small' color='success' variant='tonal' />
                            ) : (
                              <Chip label='À venir' size='small' variant='outlined' />
                            )}
                          </td>
                          <td>
                            {restrictions(l).length > 0 ? (
                              <Typography variant='body2' color='text.secondary'>
                                {restrictions(l).length} restriction(s)
                              </Typography>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td align='right'>
                            <OptionMenu
                              options={[
                                {
                                  text: 'Détails',
                                  icon: <i className='tabler-eye' />,
                                  menuItemProps: {
                                    onClick: () =>
                                      router.push(getLocalizedUrl(`/apps/ngoni/licenses/${l.id}`, lang as string))
                                  }
                                },
                                {
                                  text: 'Modifier',
                                  icon: <i className='tabler-edit' />,
                                  menuItemProps: {
                                    onClick: () =>
                                      router.push(getLocalizedUrl(`/apps/ngoni/licenses/${l.id}`, lang as string))
                                  }
                                },
                                {
                                  text: 'Restrictions',
                                  icon: <i className='tabler-world' />,
                                  menuItemProps: {
                                    onClick: () =>
                                      router.push(getLocalizedUrl(`/apps/ngoni/licenses/${l.id}`, lang as string))
                                  }
                                },
                                { divider: true },
                                {
                                  text: 'Supprimer',
                                  icon: <i className='tabler-trash' />,
                                  menuItemProps: {
                                    onClick: () => setDeleteDialog(l.id),
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
        message='Êtes-vous sûr de vouloir supprimer cette licence ?'
      />
    </Box>
  )
}
