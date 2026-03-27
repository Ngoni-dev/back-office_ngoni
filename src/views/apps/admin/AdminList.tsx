'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import StatusBadge from '@/components/StatusBadge'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import TablePagination from '@mui/material/TablePagination'
import CircularProgress from '@mui/material/CircularProgress'

import tableStyles from '@core/styles/table.module.css'

// Services
import { adminService } from '@/services/admin.service'
import { countryService, type Country } from '@/services/country.service'

// Types
import type { Admin } from '@/types/admin.types'

// Utils
import { getLocalizedUrl } from '@/utils/i18n'

// Components
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

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  moderator: 'Modérateur'
}

export default function AdminList() {
  const router = useRouter()
  const { lang } = useParams()
  const authUser = useSelector((state: RootState) => state.auth.user)
  const canReadAdmins = hasPermission(authUser, 'admins.read')
  const canWriteAdmins = hasPermission(authUser, 'admins.write')

  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounceValue(search, 400)
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [countryIdFilter, setCountryIdFilter] = useState<number | ''>('')
  const [languageFilter, setLanguageFilter] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [countries, setCountries] = useState<Country[]>([])
  const [createdFrom, setCreatedFrom] = useState('')
  const [createdTo, setCreatedTo] = useState('')
  const [sortPrimaryBy, setSortPrimaryBy] = useState<string>('created_at')
  const [sortPrimaryDir, setSortPrimaryDir] = useState<'asc' | 'desc'>('desc')
  const [sortSecondaryBy, setSortSecondaryBy] = useState<string>('')
  const [sortSecondaryDir, setSortSecondaryDir] = useState<'asc' | 'desc'>('desc')
  const [archiveFilter, setArchiveFilter] = useState<'without' | 'with' | 'only'>('without')
  const [deleteDialog, setDeleteDialog] = useState<{ id: number } | null>(null)

  const sortBy = [sortPrimaryBy, sortSecondaryBy].filter(Boolean)
  const sortDir = [sortPrimaryDir, sortSecondaryDir].slice(0, sortBy.length)

  const fetchAdmins = async () => {
    setLoading(true)
    try {
      const res = await adminService.list(page + 1, perPage, {
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
        country_id: countryIdFilter === '' ? undefined : countryIdFilter,
        language: languageFilter || undefined,
        city: cityFilter.trim() || undefined,
        created_from: createdFrom || undefined,
        created_to: createdTo || undefined,
        sort_by: sortBy,
        sort_dir: sortDir,
        trashed: archiveFilter,
        ...(statusFilter === 'all' ? {} : { status: statusFilter === 'active' })
      })
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
  }, [debouncedSearch, roleFilter, statusFilter, countryIdFilter, languageFilter, cityFilter, createdFrom, createdTo, sortPrimaryBy, sortPrimaryDir, sortSecondaryBy, sortSecondaryDir, archiveFilter])

  useEffect(() => {
    fetchAdmins()
  }, [page, perPage, debouncedSearch, roleFilter, statusFilter, countryIdFilter, languageFilter, cityFilter, createdFrom, createdTo, sortPrimaryBy, sortPrimaryDir, sortSecondaryBy, sortSecondaryDir, archiveFilter])

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

  const handleDelete = async (id: number) => {
    try {
      await adminService.delete(id)
      toast.success('Administrateur archivé')
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

  const handleRestore = async (id: number) => {
    try {
      await adminService.restore(id)
      toast.success('Administrateur restauré')
      fetchAdmins()
    } catch {
      toast.error('Restauration impossible')
    }
  }

  const handleExportCsv = async () => {
    try {
      const blob = await adminService.exportCsv({
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
        country_id: countryIdFilter === '' ? undefined : countryIdFilter,
        language: languageFilter || undefined,
        city: cityFilter.trim() || undefined,
        created_from: createdFrom || undefined,
        created_to: createdTo || undefined,
        sort_by: sortBy,
        sort_dir: sortDir,
        trashed: archiveFilter,
        ...(statusFilter === 'all' ? {} : { status: statusFilter === 'active' })
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `administrateurs_export_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`
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
    setRoleFilter('')
    setStatusFilter('all')
    setCountryIdFilter('')
    setLanguageFilter('')
    setCityFilter('')
    setCreatedFrom('')
    setCreatedTo('')
    setSortPrimaryBy('created_at')
    setSortPrimaryDir('desc')
    setSortSecondaryBy('')
    setSortSecondaryDir('desc')
    setArchiveFilter('without')
    setPage(0)
  }

  const creatorLabel = (a: Admin) => {
    const c = a.created_by
    if (c && typeof c === 'object') {
      return `${c.name} ${c.first_names}`.trim()
    }
    return '—'
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs items={[{ label: 'Administrateurs' }]} />
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title='Administrateurs'
              subheader='Comptes du back-office'
              action={
                <Box display='flex' gap={2} flexWrap='wrap' justifyContent='flex-end'>
                  <Button
                    variant='tonal'
                    startIcon={<i className='tabler-download' />}
                    onClick={handleExportCsv}
                    disabled={!canReadAdmins}
                  >
                    Export CSV
                  </Button>
                  {canWriteAdmins && (
                    <Button
                      variant='contained'
                      startIcon={<i className='tabler-plus' />}
                      onClick={() => router.push(getLocalizedUrl('/apps/admin/administrateurs/new', lang as string))}
                    >
                      Ajouter
                    </Button>
                  )}
                </Box>
              }
            />
            {!canReadAdmins ? (
              <Box className='p-6'>
                <Typography color='text.secondary'>Vous n’avez pas la permission de consulter les administrateurs.</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ px: 4, pb: 2 }}>
                  {/* Ligne 1 — même hauteur de contrôle : label flottant partout */}
                  <Grid container spacing={2} alignItems='flex-end' sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                      <CustomTextField
                        fullWidth
                        label='Rechercher'
                        placeholder='Nom, email, téléphones…'
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        size='small'
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 4, lg: 2 }}>
                      <FormControl size='small' fullWidth>
                        <InputLabel>Rôle</InputLabel>
                        <Select value={roleFilter} label='Rôle' onChange={e => setRoleFilter(e.target.value)}>
                          <MenuItem value=''>Tous</MenuItem>
                          {Object.entries(ROLE_LABELS).map(([k, v]) => (
                            <MenuItem key={k} value={k}>{v}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 6, md: 4, lg: 2 }}>
                      <FormControl size='small' fullWidth>
                        <InputLabel>Statut</InputLabel>
                        <Select value={statusFilter} label='Statut' onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}>
                          <MenuItem value='all'>Tous</MenuItem>
                          <MenuItem value='active'>Actif</MenuItem>
                          <MenuItem value='inactive'>Inactif</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 6, md: 4, lg: 2 }}>
                      <FormControl size='small' fullWidth>
                        <InputLabel>Pays</InputLabel>
                        <Select
                          value={countryIdFilter}
                          label='Pays'
                          onChange={e => setCountryIdFilter(e.target.value === '' ? '' : Number(e.target.value))}
                        >
                          <MenuItem value=''>Tous</MenuItem>
                          {countries.map(c => (
                            <MenuItem key={c.id} value={c.id}>{c.name} ({c.code})</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 6, md: 4, lg: 2 }}>
                      <FormControl size='small' fullWidth>
                        <InputLabel>Langue</InputLabel>
                        <Select value={languageFilter} label='Langue' onChange={e => setLanguageFilter(e.target.value)}>
                          <MenuItem value=''>Toutes</MenuItem>
                          <MenuItem value='fr'>Français</MenuItem>
                          <MenuItem value='en'>English</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  {/* Ligne 2 — alignement bas : ville / dates / tris / affichage / reset */}
                  <Grid container spacing={2} alignItems='flex-end'>
                    <Grid size={{ xs: 6, md: 4, lg: 2 }}>
                      <CustomTextField
                        fullWidth
                        size='small'
                        label='Ville'
                        placeholder='Contient…'
                        value={cityFilter}
                        onChange={e => setCityFilter(e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 4, lg: 1.5 }}>
                      <DateFilterField label='Créé du' value={createdFrom} onChange={setCreatedFrom} fullWidth />
                    </Grid>
                    <Grid size={{ xs: 6, md: 4, lg: 1.5 }}>
                      <DateFilterField label='au' value={createdTo} onChange={setCreatedTo} fullWidth />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3, lg: 2 }}>
                      <FormControl size='small' fullWidth>
                        <InputLabel>Tri principal</InputLabel>
                        <Select value={sortPrimaryBy} label='Tri principal' onChange={e => setSortPrimaryBy(e.target.value)}>
                          <MenuItem value='created_at'>Date création</MenuItem>
                          <MenuItem value='name'>Nom</MenuItem>
                          <MenuItem value='email'>Email</MenuItem>
                          <MenuItem value='role'>Rôle</MenuItem>
                          <MenuItem value='status'>Statut</MenuItem>
                          <MenuItem value='country_id'>Pays</MenuItem>
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
                          <MenuItem value='created_at'>Date création</MenuItem>
                          <MenuItem value='name'>Nom</MenuItem>
                          <MenuItem value='email'>Email</MenuItem>
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
                    <Grid size={{ xs: 12, sm: 6, md: 2, lg: 1.5 }}>
                      <Button
                        fullWidth
                        variant='outlined'
                        color='secondary'
                        size='medium'
                        onClick={resetFilters}
                        sx={{ height: 40, minHeight: 40 }}
                      >
                        Réinitialiser
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
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
                            <th>Langue</th>
                            <th>Créé par</th>
                            <th>Création</th>
                            <th>Statut</th>
                            <th align='right'>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {admins.map(a => {
                            const isDeleted = Boolean(a.deleted_at)
                            const isSelf = authUser?.id === a.id

                            return (
                              <tr key={a.id}>
                                <td>{a.id}</td>
                                <td>
                                  <Avatar src={a.photo || undefined} sx={{ width: 36, height: 36 }}>
                                    {a.name?.charAt(0)}{a.first_names?.charAt(0)}
                                  </Avatar>
                                </td>
                                <td>
                                  <Box display='flex' alignItems='center' gap={1} flexWrap='wrap'>
                                    <Button
                                      variant='text'
                                      color='primary'
                                      size='small'
                                      sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
                                      onClick={() => router.push(getLocalizedUrl(`/apps/admin/administrateurs/${a.id}`, lang as string))}
                                    >
                                      {a.name} {a.first_names}
                                    </Button>
                                    {isDeleted && <StatusBadge label='Archivé' tone='warning' />}
                                  </Box>
                                </td>
                                <td>{a.email}</td>
                                <td>
                                  <StatusBadge label={ROLE_LABELS[a.role] ?? a.role} tone='primary' />
                                </td>
                                <td>{a.country?.name ?? '—'}</td>
                                <td>{a.language ?? '—'}</td>
                                <td>{creatorLabel(a)}</td>
                                <td>{a.created_at ? new Date(a.created_at).toLocaleString('fr-FR') : '—'}</td>
                                <td>
                                  <StatusBadge
                                    tone={a.status ? 'success' : 'neutral'}
                                    label={a.status ? 'Actif' : 'Inactif'}
                                    onClick={() => {
                                      if (!canWriteAdmins || isDeleted || isSelf) return
                                      handleToggleStatus(a.id)
                                    }}
                                    sx={{ cursor: canWriteAdmins && !isDeleted && !isSelf ? 'pointer' : 'default' }}
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
                                      ...(canWriteAdmins
                                        ? [
                                            {
                                              text: 'Modifier',
                                              icon: <i className='tabler-edit' />,
                                              menuItemProps: {
                                                onClick: () => router.push(getLocalizedUrl(`/apps/admin/administrateurs/${a.id}/edit`, lang as string)),
                                                disabled: isDeleted
                                              }
                                            },
                                            ...(isDeleted
                                              ? [
                                                  {
                                                    text: 'Restaurer',
                                                    icon: <i className='tabler-restore' />,
                                                    menuItemProps: {
                                                      onClick: () => handleRestore(a.id)
                                                    }
                                                  }
                                                ]
                                              : [
                                                  { divider: true },
                                                  {
                                                    text: 'Archiver',
                                                    icon: <i className='tabler-trash' />,
                                                    menuItemProps: {
                                                      onClick: () => setDeleteDialog({ id: a.id }),
                                                      className: 'text-error',
                                                      disabled: isSelf
                                                    }
                                                  }
                                                ])
                                          ]
                                        : []),
                                      { divider: true },
                                      {
                                        text: 'Copier email',
                                        icon: <i className='tabler-copy' />,
                                        menuItemProps: {
                                          onClick: () => {
                                            void navigator.clipboard.writeText(a.email)
                                            toast.success('Email copié')
                                          }
                                        }
                                      }
                                    ]}
                                    iconButtonProps={{ size: 'small' }}
                                  />
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
              </>
            )}
          </Card>
        </Grid>
      </Grid>
      <DeleteConfirmDialog
        open={!!deleteDialog}
        onClose={() => setDeleteDialog(null)}
        onConfirm={async () => { if (deleteDialog) await handleDelete(deleteDialog.id) }}
        message='Archiver cet administrateur ?'
      />
    </Box>
  )
}
