'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import TablePagination from '@mui/material/TablePagination'
import CircularProgress from '@mui/material/CircularProgress'

import tableStyles from '@core/styles/table.module.css'

// Services
import { adminService } from '@/services/admin.service'

// Types
import type { Admin } from '@/types/admin.types'

// Utils
import { getLocalizedUrl } from '@/utils/i18n'

// Components
import DeleteConfirmDialog from '@/components/dialogs/DeleteConfirmDialog'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import { useDebounceValue } from '@/hooks/useDebounceValue'
import { toast } from 'react-toastify'

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  moderator: 'Modérateur'
}

export default function AdminList() {
  const router = useRouter()
  const { lang } = useParams()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounceValue(search, 400)
  const [deleteDialog, setDeleteDialog] = useState<{ id: number } | null>(null)

  const fetchAdmins = async () => {
    setLoading(true)
    try {
      const res = await adminService.list(page + 1, perPage, { search: debouncedSearch || undefined })
      setAdmins(res.data ?? [])
      setTotal(res.pagination?.total ?? 0)
    } catch {
      setAdmins([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  useEffect(() => {
    fetchAdmins()
  }, [page, perPage, debouncedSearch])

  const handlePageChange = (_: unknown, newPage: number) => setPage(newPage)
  const handlePerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPerPage(parseInt(e.target.value, 10))
    setPage(0)
  }

  const handleDelete = async (id: number) => {
    try {
      await adminService.delete(id)
      toast.success('Administrateur désactivé')
      setDeleteDialog(null)
      fetchAdmins()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleToggleStatus = async (id: number) => {
    try {
      await adminService.toggleStatus(id)
      toast.success('Statut mis à jour')
      fetchAdmins()
    } catch {
      toast.error('Erreur')
    }
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs items={[{ label: 'Administrateurs' }]} />
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title='Administrateurs'
              action={
                <Button
                  variant='contained'
                  startIcon={<i className='tabler-plus' />}
                  onClick={() => router.push(getLocalizedUrl('/apps/admin/administrateurs/new', lang as string))}
                >
                  Ajouter
                </Button>
              }
            />
            <div className='flex flex-wrap items-end gap-4 p-6 border-bs'>
              <CustomTextField
                size='small'
                placeholder='Rechercher (nom, email)'
                value={search}
                onChange={e => setSearch(e.target.value)}
                sx={{ minWidth: 220 }}
              />
            </div>
            {loading ? (
              <Box display='flex' justifyContent='center' alignItems='center' minHeight={280}>
                <CircularProgress />
              </Box>
            ) : admins.length === 0 ? (
              <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' minHeight={200} gap={2} className='p-6'>
                <i className='tabler-users-off text-5xl text-textDisabled' />
                <Typography variant='body1' color='text.secondary'>Aucun administrateur</Typography>
              </Box>
            ) : (
              <>
                <div className='overflow-x-auto'>
                  <table className={tableStyles.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Photo</th>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Pays</th>
                        <th>Statut</th>
                        <th align='right'>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map(a => (
                        <tr key={a.id}>
                          <td>{a.id}</td>
                          <td>
                            <Avatar src={a.photo || undefined} sx={{ width: 36, height: 36 }}>
                              {a.name?.charAt(0)}{a.first_names?.charAt(0)}
                            </Avatar>
                          </td>
                          <td>
                            <Button
                              variant='text'
                              color='primary'
                              size='small'
                              sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
                              onClick={() => router.push(getLocalizedUrl(`/apps/admin/administrateurs/${a.id}`, lang as string))}
                            >
                              {a.name} {a.first_names}
                            </Button>
                          </td>
                          <td>{a.email}</td>
                          <td><Chip size='small' label={ROLE_LABELS[a.role] ?? a.role} /></td>
                          <td>{a.country?.name ?? '—'}</td>
                          <td>
                            <Chip
                              size='small'
                              color={a.status ? 'success' : 'default'}
                              label={a.status ? 'Actif' : 'Inactif'}
                              onClick={() => handleToggleStatus(a.id)}
                            />
                          </td>
                          <td align='right'>
                            <OptionMenu
                              options={[
                                {
                                  text: 'Détails',
                                  icon: <i className='tabler-eye' />,
                                  menuItemProps: {
                                    onClick: () => router.push(getLocalizedUrl(`/apps/admin/administrateurs/${a.id}`, lang as string))
                                  }
                                },
                                {
                                  text: 'Modifier',
                                  icon: <i className='tabler-edit' />,
                                  menuItemProps: {
                                    onClick: () => router.push(getLocalizedUrl(`/apps/admin/administrateurs/${a.id}`, lang as string))
                                  }
                                },
                                { divider: true },
                                {
                                  text: 'Supprimer',
                                  icon: <i className='tabler-trash' />,
                                  menuItemProps: {
                                    onClick: () => setDeleteDialog({ id: a.id }),
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
        open={!!deleteDialog}
        onClose={() => setDeleteDialog(null)}
        onConfirm={async () => { if (deleteDialog) await handleDelete(deleteDialog.id) }}
        message='Désactiver cet administrateur ?'
      />
    </Box>
  )
}
