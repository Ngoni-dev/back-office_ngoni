'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import StatusBadge, { toneFromLegacyChipColor } from '@/components/StatusBadge'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux-store'
import { hasPermission } from '@/utils/acl'
import { kycService, type KycDocument } from '@/services/kyc.service'
import CustomTextField from '@core/components/mui/TextField'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import { getLocalizedUrl } from '@/utils/i18n'
import tableStyles from '@core/styles/table.module.css'

const STATUS_COLORS: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  EXPIRED: 'default'
}

export default function KycList() {
  const router = useRouter()
  const { lang } = useParams()
  const authUser = useSelector((state: RootState) => state.auth.user)
  const canRead = hasPermission(authUser, 'kyc.read')
  const canWrite = hasPermission(authUser, 'kyc.write')

  const [items, setItems] = useState<KycDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const fetchData = async () => {
    if (!canRead) return
    setLoading(true)
    try {
      const res = await kycService.list(page + 1, perPage, { search: search || undefined, status: status || undefined })
      setItems(res.data ?? [])
      setTotal(res.pagination?.total ?? 0)
    } catch {
      setItems([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, perPage, search, status, canRead])

  const resetFilters = () => {
    setSearch('')
    setStatus('')
    setPage(0)
  }

  const review = async (id: number, nextStatus: 'APPROVED' | 'REJECTED') => {
    try {
      await kycService.review(id, {
        status: nextStatus,
        ...(nextStatus === 'REJECTED' ? { rejection_reason: 'Rejeté par modération admin' } : {})
      })
      toast.success('Revue KYC mise à jour')
      fetchData()
    } catch {
      toast.error('Échec de la revue KYC')
    }
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs items={[{ label: 'KYC' }]} />
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title='Documents KYC' subheader='File des documents en attente et traités' />
            {!canRead ? (
              <Box className='p-6'>
                <Typography color='text.secondary'>Vous n’avez pas la permission de consulter les documents KYC.</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ px: 4, pb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <CustomTextField
                    size='small'
                    placeholder='Rechercher utilisateur...'
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    sx={{ minWidth: 240 }}
                  />
                  <FormControl size='small' sx={{ minWidth: 180 }}>
                    <InputLabel>Statut</InputLabel>
                    <Select value={status} label='Statut' onChange={e => setStatus(e.target.value)}>
                      <MenuItem value=''>Tous</MenuItem>
                      <MenuItem value='PENDING'>En attente</MenuItem>
                      <MenuItem value='APPROVED'>Approuvé</MenuItem>
                      <MenuItem value='REJECTED'>Rejeté</MenuItem>
                      <MenuItem value='EXPIRED'>Expiré</MenuItem>
                    </Select>
                  </FormControl>
                  <Button variant='outlined' color='secondary' size='small' onClick={resetFilters} sx={{ minHeight: 40, textTransform: 'none' }}>
                    Réinitialiser
                  </Button>
                </Box>
                {loading ? (
                  <Box display='flex' justifyContent='center' alignItems='center' minHeight={200}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <div className='overflow-x-auto'>
                      <table className={tableStyles.table}>
                        <thead>
                          <tr>
                            <th>Utilisateur</th>
                            <th>Type</th>
                            <th>Statut</th>
                            <th>Date</th>
                            <th align='right'>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map(item => (
                            <tr key={item.id}>
                              <td>{item.user?.display_name ?? item.user?.username ?? `#${item.user_id}`}</td>
                              <td>{item.document_type}</td>
                              <td>
                                <StatusBadge
                                  label={item.status}
                                  tone={toneFromLegacyChipColor(STATUS_COLORS[item.status] ?? 'default')}
                                />
                              </td>
                              <td>{item.created_at ? new Date(item.created_at).toLocaleString('fr-FR') : '—'}</td>
                              <td align='right'>
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                  <button
                                    className='text-primary'
                                    onClick={() => router.push(getLocalizedUrl(`/apps/kyc/${item.id}`, lang as string))}
                                  >
                                    Voir
                                  </button>
                                  {canWrite && item.status === 'PENDING' && (
                                    <>
                                      <button className='text-success' onClick={() => review(item.id, 'APPROVED')}>
                                        Approuver
                                      </button>
                                      <button className='text-error' onClick={() => review(item.id, 'REJECTED')}>
                                        Rejeter
                                      </button>
                                    </>
                                  )}
                                </Box>
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
                      onPageChange={(_, p) => setPage(p)}
                      rowsPerPage={perPage}
                      onRowsPerPageChange={e => {
                        setPerPage(parseInt(e.target.value, 10))
                        setPage(0)
                      }}
                      rowsPerPageOptions={[10, 15, 25, 50]}
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
