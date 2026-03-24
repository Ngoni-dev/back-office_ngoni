'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

import tableStyles from '@core/styles/table.module.css'

import { roleService } from '@/services/role.service'
import type { Role } from '@/services/role.service'
import { getLocalizedUrl } from '@/utils/i18n'
import DeleteConfirmDialog from '@/components/dialogs/DeleteConfirmDialog'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import OptionMenu from '@core/components/option-menu'
import { toast } from 'react-toastify'

export default function RoleList() {
  const router = useRouter()
  const { lang } = useParams()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ id: number } | null>(null)

  const fetchRoles = () => {
    setLoading(true)
    roleService.list()
      .then(res => setRoles(res.data ?? []))
      .catch(() => setRoles([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchRoles()
  }, [])

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

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs items={[{ label: 'Rôles' }]} />
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title='Rôles'
              subheader='Gestion des rôles administrateurs'
              action={
                <Button
                  variant='contained'
                  startIcon={<i className='tabler-plus' />}
                  onClick={() => router.push(getLocalizedUrl('/apps/admin/roles/new', lang as string))}
                >
                  Ajouter
                </Button>
              }
            />
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
              <div className='overflow-x-auto'>
                <table className={tableStyles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nom</th>
                      <th>Description</th>
                      <th align='right'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map(r => (
                      <tr key={r.id}>
                        <td>{r.id}</td>
                        <td>{r.name}</td>
                        <td>{r.description ?? '—'}</td>
                        <td align='right'>
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
