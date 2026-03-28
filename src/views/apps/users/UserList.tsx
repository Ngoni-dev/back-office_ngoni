'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import StatusBadge, { toneFromLegacyChipColor } from '@/components/StatusBadge'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import TablePagination from '@mui/material/TablePagination'
import CircularProgress from '@mui/material/CircularProgress'

import tableStyles from '@core/styles/table.module.css'

import { userService, type User, type UserOverviewData } from '@/services/user.service'
import { countryService, type Country } from '@/services/country.service'
import { getLocalizedUrl } from '@/utils/i18n'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import { useDebounceValue } from '@/hooks/useDebounceValue'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux-store'
import { hasPermission } from '@/utils/acl'
import DateFilterField from '@/components/filters/DateFilterField'
import UserOverviewCards from './UserOverviewCards'

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
  const authUser = useSelector((state: RootState) => state.auth.user)
  const canReadUsers = hasPermission(authUser, 'users.read')
  const canWriteUsers = hasPermission(authUser, 'users.write')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [countryIdFilter, setCountryIdFilter] = useState<number | ''>('')
  const [countries, setCountries] = useState<Country[]>([])
  const [createdFrom, setCreatedFrom] = useState('')
  const [createdTo, setCreatedTo] = useState('')
  const [sortPrimaryBy, setSortPrimaryBy] = useState<string>('created_at')
  const [sortPrimaryDir, setSortPrimaryDir] = useState<'asc' | 'desc'>('desc')
  const [sortSecondaryBy, setSortSecondaryBy] = useState<string>('')
  const [sortSecondaryDir, setSortSecondaryDir] = useState<'asc' | 'desc'>('desc')
  const [archiveFilter, setArchiveFilter] = useState<'without' | 'with' | 'only'>('without')
  const [overview, setOverview] = useState<UserOverviewData | null>(null)
  const [overviewLoading, setOverviewLoading] = useState(true)
  const debouncedSearch = useDebounceValue(search, 400)

  const sortBy = [sortPrimaryBy, sortSecondaryBy].filter(Boolean)
  const sortDir = [sortPrimaryDir, sortSecondaryDir].slice(0, sortBy.length)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await userService.list(page + 1, perPage, {
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        role: roleFilter || undefined,
        country_id: countryIdFilter === '' ? undefined : countryIdFilter,
        created_from: createdFrom || undefined,
        created_to: createdTo || undefined,
        sort_by: sortBy,
        sort_dir: sortDir,
        trashed: archiveFilter
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
  }, [debouncedSearch, statusFilter, roleFilter, archiveFilter, countryIdFilter, createdFrom, createdTo, sortPrimaryBy, sortPrimaryDir, sortSecondaryBy, sortSecondaryDir])

  useEffect(() => {
    fetchUsers()
  }, [page, perPage, debouncedSearch, statusFilter, roleFilter, archiveFilter, countryIdFilter, createdFrom, createdTo, sortPrimaryBy, sortPrimaryDir, sortSecondaryBy, sortSecondaryDir])

  useEffect(() => {
    if (!canReadUsers) {
      setOverview(null)
      setOverviewLoading(false)
      return
    }

    let cancelled = false
    setOverviewLoading(true)

    void (async () => {
      try {
        const res = await userService.overview()
        if (!cancelled) setOverview(res.data ?? null)
      } catch {
        if (!cancelled) setOverview(null)
      } finally {
        if (!cancelled) setOverviewLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [canReadUsers])

  useEffect(() => {
    countryService
      .list()
      .then(res => setCountries(res.data ?? []))
      .catch(() => setCountries([]))
  }, [])

  const handlePageChange = (_: unknown, newPage: number) => setPage(newPage)
  const handlePerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPerPage(parseInt(e.target.value, 10))
    setPage(0)
  }

  const handleUpdateStatus = async (
    id: number,
    status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING_VERIFICATION'
  ) => {
    try {
      await userService.updateStatus(id, status)
      toast.success('Statut utilisateur mis à jour')
      fetchUsers()
    } catch {
      toast.error('Impossible de mettre à jour le statut')
    }
  }

  const handleUpdateRole = async (id: number, role: 'PERSONAL' | 'BUSINESS' | 'CREATOR') => {
    try {
      await userService.updateRole(id, role)
      toast.success('Rôle utilisateur mis à jour')
      fetchUsers()
    } catch {
      toast.error('Impossible de mettre à jour le rôle')
    }
  }

  const handleArchive = async (id: number) => {
    try {
      await userService.delete(id)
      toast.success('Utilisateur archivé')
      fetchUsers()
    } catch {
      toast.error('Impossible d’archiver cet utilisateur')
    }
  }

  const handleRestore = async (id: number) => {
    try {
      await userService.restore(id)
      toast.success('Utilisateur restauré')
      fetchUsers()
    } catch {
      toast.error('Impossible de restaurer cet utilisateur')
    }
  }

  const handleExportCsv = async () => {
    try {
      const blob = await userService.exportCsv({
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        role: roleFilter || undefined,
        country_id: countryIdFilter === '' ? undefined : countryIdFilter,
        created_from: createdFrom || undefined,
        created_to: createdTo || undefined,
        sort_by: sortBy,
        sort_dir: sortDir,
        trashed: archiveFilter
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users_export_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success('Export CSV généré')
    } catch {
      toast.error('Export CSV impossible')
    }
  }

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('')
    setRoleFilter('')
    setCountryIdFilter('')
    setCreatedFrom('')
    setCreatedTo('')
    setSortPrimaryBy('created_at')
    setSortPrimaryDir('desc')
    setSortSecondaryBy('')
    setSortSecondaryDir('desc')
    setArchiveFilter('without')
    setPage(0)
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs items={[{ label: 'Utilisateurs' }]} />
      {canReadUsers ? <UserOverviewCards data={overview} loading={overviewLoading} /> : null}
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title='Utilisateurs'
              subheader='Liste des utilisateurs de la plateforme'
              action={
                <Button
                  variant='tonal'
                  startIcon={<i className='tabler-download' />}
                  onClick={handleExportCsv}
                  disabled={!canReadUsers}
                >
                  Export CSV
                </Button>
              }
            />
            {!canReadUsers ? (
              <Box className='p-6'>
                <Typography color='text.secondary'>Vous n’avez pas la permission de consulter les utilisateurs.</Typography>
              </Box>
            ) : (
              <>
            <Box sx={{ px: 4, pb: 2 }}>
              <Grid container spacing={2} alignItems='center'>
                <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                  <CustomTextField
                    fullWidth
                    placeholder='Rechercher (username, nom, téléphone)...'
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    size='small'
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 4, lg: 2 }}>
                  <FormControl size='small' fullWidth>
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
                </Grid>
                <Grid size={{ xs: 6, md: 4, lg: 2 }}>
                  <FormControl size='small' fullWidth>
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
                </Grid>
                <Grid size={{ xs: 6, md: 4, lg: 2 }}>
                  <FormControl size='small' fullWidth>
                    <InputLabel>Pays</InputLabel>
                    <Select
                      value={countryIdFilter === '' ? '' : String(countryIdFilter)}
                      label='Pays'
                      onChange={e => {
                        const v = e.target.value
                        setCountryIdFilter(v === '' ? '' : Number(v))
                      }}
                    >
                      <MenuItem value=''>Tous</MenuItem>
                      {countries.map(c => (
                        <MenuItem key={c.id} value={String(c.id)}>
                          {c.name} ({c.code})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, md: 4, lg: 1.5 }}>
                  <DateFilterField label='Inscrit du' value={createdFrom} onChange={setCreatedFrom} fullWidth />
                </Grid>
                <Grid size={{ xs: 6, md: 4, lg: 1.5 }}>
                  <DateFilterField label='au' value={createdTo} onChange={setCreatedTo} fullWidth />
                </Grid>

                <Grid size={{ xs: 6, md: 3, lg: 2 }}>
                  <FormControl size='small' fullWidth>
                    <InputLabel>Tri principal</InputLabel>
                    <Select value={sortPrimaryBy} label='Tri principal' onChange={e => setSortPrimaryBy(e.target.value)}>
                      <MenuItem value='created_at'>Date inscription</MenuItem>
                      <MenuItem value='username'>Username</MenuItem>
                      <MenuItem value='display_name'>Nom affiché</MenuItem>
                      <MenuItem value='followers_count'>Followers</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, md: 2, lg: 1.5 }}>
                  <FormControl size='small' fullWidth>
                    <InputLabel>Ordre</InputLabel>
                    <Select value={sortPrimaryDir} label='Ordre' onChange={e => setSortPrimaryDir(e.target.value as 'asc' | 'desc')}>
                      <MenuItem value='desc'>Desc</MenuItem>
                      <MenuItem value='asc'>Asc</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, md: 3, lg: 2 }}>
                  <FormControl size='small' fullWidth>
                    <InputLabel>Tri secondaire</InputLabel>
                    <Select value={sortSecondaryBy} label='Tri secondaire' onChange={e => setSortSecondaryBy(e.target.value)}>
                      <MenuItem value=''>Aucun</MenuItem>
                      <MenuItem value='created_at'>Date inscription</MenuItem>
                      <MenuItem value='username'>Username</MenuItem>
                      <MenuItem value='status'>Statut</MenuItem>
                      <MenuItem value='role'>Rôle</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, md: 2, lg: 1.5 }}>
                  <FormControl size='small' fullWidth disabled={!sortSecondaryBy}>
                    <InputLabel>Ordre 2</InputLabel>
                    <Select value={sortSecondaryDir} label='Ordre 2' onChange={e => setSortSecondaryDir(e.target.value as 'asc' | 'desc')}>
                      <MenuItem value='desc'>Desc</MenuItem>
                      <MenuItem value='asc'>Asc</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, md: 3, lg: 2 }}>
                  <FormControl size='small' fullWidth>
                    <InputLabel>Affichage</InputLabel>
                    <Select
                      value={archiveFilter}
                      label='Affichage'
                      onChange={e => setArchiveFilter(e.target.value as 'without' | 'with' | 'only')}
                    >
                      <MenuItem value='without'>Actifs</MenuItem>
                      <MenuItem value='only'>Archivés</MenuItem>
                      <MenuItem value='with'>Tous</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 2, lg: 1.5 }}>
                  <Button fullWidth variant='outlined' color='secondary' onClick={resetFilters}>
                    Réinitialiser
                  </Button>
                </Grid>
              </Grid>
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
                            <StatusBadge
                              label={STATUS_LABELS[u.status] ?? u.status}
                              tone={toneFromLegacyChipColor(STATUS_COLORS[u.status] ?? 'default')}
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
                                },
                                { divider: true },
                                ...(u.deleted_at
                                  ? [
                                      {
                                        text: 'Restaurer',
                                        icon: <i className='tabler-restore' />,
                                        menuItemProps: {
                                          onClick: () => handleRestore(u.id),
                                          className: 'text-success',
                                          disabled: !canWriteUsers
                                        }
                                      }
                                    ]
                                  : [
                                      {
                                        text: 'Activer',
                                        icon: <i className='tabler-check' />,
                                        menuItemProps: { onClick: () => handleUpdateStatus(u.id, 'ACTIVE'), disabled: !canWriteUsers }
                                      },
                                      {
                                        text: 'Suspendre',
                                        icon: <i className='tabler-player-pause' />,
                                        menuItemProps: { onClick: () => handleUpdateStatus(u.id, 'SUSPENDED'), disabled: !canWriteUsers }
                                      },
                                      {
                                        text: 'Bannir',
                                        icon: <i className='tabler-ban' />,
                                        menuItemProps: {
                                          onClick: () => handleUpdateStatus(u.id, 'BANNED'),
                                          className: 'text-error',
                                          disabled: !canWriteUsers
                                        }
                                      },
                                      { divider: true },
                                      {
                                        text: 'Rôle Personnel',
                                        icon: <i className='tabler-user' />,
                                        menuItemProps: { onClick: () => handleUpdateRole(u.id, 'PERSONAL'), disabled: !canWriteUsers }
                                      },
                                      {
                                        text: 'Rôle Entreprise',
                                        icon: <i className='tabler-building' />,
                                        menuItemProps: { onClick: () => handleUpdateRole(u.id, 'BUSINESS'), disabled: !canWriteUsers }
                                      },
                                      {
                                        text: 'Rôle Créateur',
                                        icon: <i className='tabler-star' />,
                                        menuItemProps: { onClick: () => handleUpdateRole(u.id, 'CREATOR'), disabled: !canWriteUsers }
                                      },
                                      { divider: true },
                                      {
                                        text: 'Archiver',
                                        icon: <i className='tabler-archive' />,
                                        menuItemProps: {
                                          onClick: () => handleArchive(u.id),
                                          className: 'text-warning',
                                          disabled: !canWriteUsers
                                        }
                                      }
                                    ])
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
              </>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
