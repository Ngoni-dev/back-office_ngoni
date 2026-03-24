'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import TablePagination from '@mui/material/TablePagination'
import CircularProgress from '@mui/material/CircularProgress'

import tableStyles from '@core/styles/table.module.css'

import { userService, type User } from '@/services/user.service'
import { getLocalizedUrl } from '@/utils/i18n'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import { useDebounceValue } from '@/hooks/useDebounceValue'

const ROLE_LABELS: Record<string, string> = {
  PERSONAL: 'Personnel',
  BUSINESS: 'Entreprise',
  CREATOR: 'Créateur'
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Actif',
  SUSPENDED: 'Suspendu',
  BANNED: 'Banni',
  PENDING_VERIFICATION: 'En attente'
}

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  BANNED: 'error',
  PENDING_VERIFICATION: 'default'
}

export default function UserList() {
  const router = useRouter()
  const { lang } = useParams()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const debouncedSearch = useDebounceValue(search, 400)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await userService.list(page + 1, perPage, {
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        role: roleFilter || undefined
      })
      setUsers(res.data ?? [])
      setTotal(res.pagination?.total ?? 0)
    } catch {
      setUsers([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, statusFilter, roleFilter])

  useEffect(() => {
    fetchUsers()
  }, [page, perPage, debouncedSearch, statusFilter, roleFilter])

  const handlePageChange = (_: unknown, newPage: number) => setPage(newPage)
  const handlePerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPerPage(parseInt(e.target.value, 10))
    setPage(0)
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs items={[{ label: 'Utilisateurs' }]} />
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title='Utilisateurs' subheader='Liste des utilisateurs de la plateforme (BO-013)' />
            <Box sx={{ px: 4, pb: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <CustomTextField
                placeholder='Rechercher (username, nom, téléphone)...'
                value={search}
                onChange={e => setSearch(e.target.value)}
                size='small'
                sx={{ minWidth: 240 }}
              />
              <FormControl size='small' sx={{ minWidth: 140 }}>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={statusFilter}
                  label='Statut'
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <MenuItem value=''>Tous</MenuItem>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <MenuItem key={k} value={k}>{v}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size='small' sx={{ minWidth: 140 }}>
                <InputLabel>Rôle</InputLabel>
                <Select
                  value={roleFilter}
                  label='Rôle'
                  onChange={e => setRoleFilter(e.target.value)}
                >
                  <MenuItem value=''>Tous</MenuItem>
                  {Object.entries(ROLE_LABELS).map(([k, v]) => (
                    <MenuItem key={k} value={k}>{v}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            {loading ? (
              <Box display='flex' justifyContent='center' alignItems='center' minHeight={200}>
                <CircularProgress />
              </Box>
            ) : users.length === 0 ? (
              <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' minHeight={200} gap={2} className='p-6'>
                <i className='tabler-users-off text-5xl text-textDisabled' />
                <Typography variant='body1' color='text.secondary'>Aucun utilisateur</Typography>
              </Box>
            ) : (
              <>
                <div className='overflow-x-auto'>
                  <table className={tableStyles.table}>
                    <thead>
                      <tr>
                        <th>Utilisateur</th>
                        <th>Rôle</th>
                        <th>Statut</th>
                        <th>Pays</th>
                        <th>Inscription</th>
                        <th align='right'>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id}>
                          <td>
                            <Box display='flex' alignItems='center' gap={2}>
                              <Avatar
                                src={u.avatar_url ?? undefined}
                                sx={{ width: 36, height: 36 }}
                              >
                                {(u.display_name ?? u.username).charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant='body2' fontWeight={500}>
                                  {u.display_name ?? u.username}
                                </Typography>
                                <Typography variant='caption' color='text.secondary'>
                                  @{u.username}
                                </Typography>
                              </Box>
                            </Box>
                          </td>
                          <td>{ROLE_LABELS[u.role] ?? u.role}</td>
                          <td>
                            <Chip
                              label={STATUS_LABELS[u.status] ?? u.status}
                              color={STATUS_COLORS[u.status] ?? 'default'}
                              size='small'
                            />
                          </td>
                          <td>{u.country?.name ?? '—'}</td>
                          <td>{u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '—'}</td>
                          <td align='right'>
                            <OptionMenu
                              options={[
                                {
                                  text: 'Voir',
                                  icon: <i className='tabler-eye' />,
                                  menuItemProps: {
                                    onClick: () =>
                                      router.push(getLocalizedUrl(`/apps/users/${u.id}`, lang as string))
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
                />
              </>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
