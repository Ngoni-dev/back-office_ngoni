'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TablePagination from '@mui/material/TablePagination'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

import tableStyles from '@core/styles/table.module.css'

import { roleService } from '@/services/role.service'
import type { Role } from '@/services/role.service'
import { getLocalizedUrl } from '@/utils/i18n'
import DeleteConfirmDialog from '@/components/dialogs/DeleteConfirmDialog'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import DateFilterField from '@/components/filters/DateFilterField'
import { useDebounceValue } from '@/hooks/useDebounceValue'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux-store'
import { hasPermission } from '@/utils/acl'

export default function RoleList() {
  const router = useRouter()
  const { lang } = useParams()
  const authUser = useSelector((state: RootState) => state.auth.user)
  const canWriteRoles = hasPermission(authUser, 'roles.write')

  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounceValue(search, 400)
  const [createdFrom, setCreatedFrom] = useState('')
  const [createdTo, setCreatedTo] = useState('')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [deleteDialog, setDeleteDialog] = useState<{ id: number } | null>(null)

  const fetchRoles = () => {
    setLoading(true)
    roleService
      .list(page + 1, perPage, {
        search: debouncedSearch || undefined,
        created_from: createdFrom || undefined,
        created_to: createdTo || undefined,
        sort_by: sortBy,
        sort_dir: sortDir
      })
      .then(res => {
        setRoles(res.data ?? [])
        setTotal(res.pagination?.total ?? 0)
      })
      .catch(() => {
        setRoles([])
        setTotal(0)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, createdFrom, createdTo, sortBy, sortDir])

  useEffect(() => {
    fetchRoles()
  }, [page, perPage, debouncedSearch, createdFrom, createdTo, sortBy, sortDir])

  const handlePageChange = (_: unknown, newPage: number) => setPage(newPage)
  const handlePerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPerPage(parseInt(e.target.value, 10))
    setPage(0)
  }

  const handleDelete = async (id: number) => {
    try {
      await roleService.delete(id)
      toast.success('Rôle supprimé')
      setDeleteDialog(null)
      fetchRoles()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const resetFilters = () => {
    setSearch('')
    setCreatedFrom('')
    setCreatedTo('')
    setSortBy('created_at')
    setSortDir('desc')
    setPage(0)
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs items={[{ label: 'Rôles' }]} />
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title='Rôles'
              subheader='Gestion des rôles et des permissions (ACL)'
              action={
                canWriteRoles && (
                  <Button
                    variant='contained'
                    startIcon={<i className='tabler-plus' />}
                    onClick={() => router.push(getLocalizedUrl('/apps/admin/roles/new', lang as string))}
                  >
                    Ajouter
                  </Button>
                )
              }
            />
            <Box sx={{ px: 4, pb: 2 }}>
              <Grid container spacing={2} alignItems='flex-end'>
                <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                  <CustomTextField
                    fullWidth
                    size='small'
                    label='Rechercher'
                    placeholder='Nom ou description…'
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 3, lg: 2 }}>
                  <DateFilterField label='Créé du' value={createdFrom} onChange={setCreatedFrom} fullWidth />
                </Grid>
                <Grid size={{ xs: 6, md: 3, lg: 2 }}>
                  <DateFilterField label='Créé au' value={createdTo} onChange={setCreatedTo} fullWidth />
                </Grid>
                <Grid size={{ xs: 6, md: 3, lg: 2 }}>
                  <FormControl size='small' fullWidth>
                    <InputLabel>Tri</InputLabel>
                    <Select value={sortBy} label='Tri' onChange={e => setSortBy(e.target.value)}>
                      <MenuItem value='created_at'>Date création</MenuItem>
                      <MenuItem value='name'>Nom</MenuItem>
                      <MenuItem value='id'>ID</MenuItem>
                      <MenuItem value='updated_at'>Mise à jour</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, md: 2, lg: 1.5 }}>
                  <FormControl size='small' fullWidth>
                    <InputLabel>Ordre</InputLabel>
                    <Select value={sortDir} label='Ordre' onChange={e => setSortDir(e.target.value as 'asc' | 'desc')}>
                      <MenuItem value='desc'>Desc</MenuItem>
                      <MenuItem value='asc'>Asc</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2, lg: 1.5 }}>
                  <Button fullWidth variant='outlined' color='secondary' onClick={resetFilters} sx={{ height: 40, minHeight: 40 }}>
                    Réinitialiser
                  </Button>
                </Grid>
              </Grid>
            </Box>
            {loading ? (
              <Box display='flex' justifyContent='center' alignItems='center' minHeight={200}>
                <CircularProgress />
              </Box>
            ) : roles.length === 0 ? (
              <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' minHeight={200} gap={2} className='p-6'>
                <i className='tabler-shield-off text-5xl text-textDisabled' />
                <Typography variant='body1' color='text.secondary'>Aucun rôle</Typography>
                <Typography variant='body2' color='text.secondary'>Exécutez: php artisan db:seed dans ngoni_admin_api_dev</Typography>
              </Box>
            ) : (
              <>
                <div className='overflow-x-auto'>
                  <table className={tableStyles.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Description</th>
                        <th>Permissions (ACL)</th>
                        <th>Création</th>
                        <th align='right'>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map(r => {
                        const perms = r.permissions ?? []
                        return (
                          <tr key={r.id}>
                            <td>{r.id}</td>
                            <td>
                              <Typography variant='body2' fontWeight={600}>{r.name}</Typography>
                            </td>
                            <td>
                              <Typography variant='body2' color='text.secondary' sx={{ maxWidth: 280 }}>
                                {r.description ?? '—'}
                              </Typography>
                            </td>
                            <td>
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: 0.5,
                                  maxWidth: 420,
                                  maxHeight: 120,
                                  overflowY: 'auto',
                                  py: 0.5
                                }}
                              >
                                {perms.length === 0 ? (
                                  <Typography variant='caption' color='text.secondary'>Aucune</Typography>
                                ) : (
                                  perms.map(p => (
                                    <Tooltip
                                      key={p.id}
                                      title={p.description ? `${p.name} — ${p.description}` : p.name}
                                      placement='top'
                                    >
                                      <Chip size='small' label={p.name} variant='outlined' color='primary' />
                                    </Tooltip>
                                  ))
                                )}
                              </Box>
                              {perms.length > 0 && (
                                <Typography variant='caption' color='text.secondary' display='block' sx={{ mt: 0.5 }}>
                                  {perms.length} permission{perms.length > 1 ? 's' : ''}
                                </Typography>
                              )}
                            </td>
                            <td>
                              <Typography variant='body2'>
                                {r.created_at ? new Date(r.created_at).toLocaleString('fr-FR') : '—'}
                              </Typography>
                            </td>
                            <td align='right'>
                              {canWriteRoles ? (
                                <OptionMenu
                                  options={[
                                    {
                                      text: 'Modifier',
                                      icon: <i className='tabler-edit' />,
                                      menuItemProps: {
                                        onClick: () => router.push(getLocalizedUrl(`/apps/admin/roles/${r.id}/edit`, lang as string))
                                      }
                                    },
                                    { divider: true },
                                    {
                                      text: 'Supprimer',
                                      icon: <i className='tabler-trash' />,
                                      menuItemProps: {
                                        onClick: () => setDeleteDialog({ id: r.id }),
                                        className: 'text-error'
                                      }
                                    }
                                  ]}
                                  iconButtonProps={{ size: 'small' }}
                                />
                              ) : (
                                <Button
                                  size='small'
                                  variant='text'
                                  onClick={() => router.push(getLocalizedUrl(`/apps/admin/roles/${r.id}/edit`, lang as string))}
                                >
                                  Voir
                                </Button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
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
        open={!!deleteDialog}
        onClose={() => setDeleteDialog(null)}
        onConfirm={async () => { if (deleteDialog) await handleDelete(deleteDialog.id) }}
        message='Supprimer ce rôle ?'
      />
    </Box>
  )
}
