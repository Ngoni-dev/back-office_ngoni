'use client'

import { useCallback, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux-store'
import { hasPermission } from '@/utils/acl'
import type { Wallet, WalletOverviewData, WalletStatus } from '@/services/wallet.service'
import { walletService } from '@/services/wallet.service'
import { useParams, useRouter } from 'next/navigation'
import { getLocalizedUrl } from '@/utils/i18n'
import { useDebounceValue } from '@/hooks/useDebounceValue'
import { MoneyCell, walletStatusChip } from './walletUi'
import WalletOverviewCards from './WalletOverviewCards'

export default function WalletList() {
  const { lang } = useParams()
  const router = useRouter()
  const authUser = useSelector((state: RootState) => state.auth.user)
  const canRead = hasPermission(authUser, 'wallets.read')

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Wallet[]>([])
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<WalletStatus | ''>('')
  const debouncedSearch = useDebounceValue(search, 350)
  const [overview, setOverview] = useState<WalletOverviewData | null>(null)
  const [overviewLoading, setOverviewLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!canRead) return
    setLoading(true)
    try {
      const res = await walletService.list(page + 1, perPage, {
        search: debouncedSearch || undefined,
        status: status || undefined
      })
      setItems(res.data ?? [])
      setTotal(res.pagination?.total ?? 0)
    } catch {
      setItems([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [canRead, page, perPage, debouncedSearch, status])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!canRead) {
      setOverview(null)
      setOverviewLoading(false)
      return
    }
    let cancelled = false
    setOverviewLoading(true)
    void (async () => {
      try {
        const res = await walletService.overview()
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
  }, [canRead])

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, status])

  const clearFilters = () => {
    setSearch('')
    setStatus('')
    setPage(0)
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs items={[{ label: 'Wallets' }]} />
      {canRead ? (
        <WalletOverviewCards data={overview} loading={overviewLoading} />
      ) : null}
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title='Wallets' subheader='Liste des portefeuilles, soldes et conformité' />

            {!canRead ? (
              <Box className='p-6'>
                <Typography color='text.secondary'>Vous n’avez pas la permission de consulter les wallets.</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ px: 4, pb: 2 }}>
                  <Grid container spacing={2} alignItems='center'>
                    <Grid size={{ xs: 12, md: 6, lg: 5 }}>
                      <CustomTextField
                        fullWidth
                        size='small'
                        placeholder='Rechercher (utilisateur, ID wallet ou ID utilisateur)…'
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <FormControl size='small' fullWidth>
                        <InputLabel>Statut</InputLabel>
                        <Select
                          value={status}
                          label='Statut'
                          onChange={e => setStatus(e.target.value as WalletStatus | '')}
                        >
                          <MenuItem value=''>Tous</MenuItem>
                          <MenuItem value='ACTIVE'>Actif</MenuItem>
                          <MenuItem value='FROZEN'>Gelé</MenuItem>
                          <MenuItem value='SUSPENDED'>Suspendu</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2, lg: 2 }}>
                      <Button fullWidth variant='outlined' color='secondary' onClick={clearFilters}>
                        Réinitialiser
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                {loading ? (
                  <Box display='flex' justifyContent='center' alignItems='center' minHeight={220}>
                    <CircularProgress />
                  </Box>
                ) : items.length === 0 ? (
                  <Box
                    display='flex'
                    flexDirection='column'
                    alignItems='center'
                    justifyContent='center'
                    minHeight={220}
                    gap={2}
                    className='p-6'
                  >
                    <i className='tabler-wallet-off text-5xl text-textDisabled' />
                    <Typography variant='body1' color='text.secondary'>
                      Aucun wallet ne correspond à ces critères.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <div className='overflow-x-auto'>
                      <table className={tableStyles.table}>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Utilisateur</th>
                            <th>Solde</th>
                            <th>En attente</th>
                            <th>Total gagné</th>
                            <th>Statut</th>
                            <th>Plafonds</th>
                            <th align='right'>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map(w => (
                            <tr key={w.id}>
                              <td>{w.id}</td>
                              <td>{w.user?.display_name ?? w.user?.username ?? `#${w.user_id}`}</td>
                              <td>
                                <MoneyCell value={w.balance} />
                              </td>
                              <td>
                                <MoneyCell value={w.pending_balance} />
                              </td>
                              <td>
                                <MoneyCell value={w.total_earned} />
                              </td>
                              <td>{walletStatusChip(w.status)}</td>
                              <td>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                                  <Box>
                                    <Typography variant='caption' color='text.secondary' display='block'>
                                      Plafond jour
                                    </Typography>
                                    <MoneyCell value={w.daily_limit} />
                                  </Box>
                                  <Box>
                                    <Typography variant='caption' color='text.secondary' display='block'>
                                      Plafond mois
                                    </Typography>
                                    <MoneyCell value={w.monthly_limit} />
                                  </Box>
                                </Box>
                              </td>
                              <td align='right'>
                                <OptionMenu
                                  iconButtonProps={{ size: 'small' }}
                                  options={[
                                    {
                                      text: 'Voir le détail',
                                      icon: <i className='tabler-eye' />,
                                      menuItemProps: {
                                        onClick: () => router.push(getLocalizedUrl(`/apps/wallets/${w.id}`, lang as string))
                                      }
                                    }
                                  ]}
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
                      onPageChange={(_, p) => setPage(p)}
                      rowsPerPage={perPage}
                      onRowsPerPageChange={e => {
                        setPerPage(parseInt(e.target.value, 10))
                        setPage(0)
                      }}
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
