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
import { walletService, type WalletTxStatus, type WalletTxType, type WalletTransaction } from '@/services/wallet.service'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { getLocalizedUrl } from '@/utils/i18n'
import {
  MoneyCell,
  TX_STATUS_FILTER_OPTIONS,
  TX_TYPE_FILTER_OPTIONS,
  referenceDisplayFr,
  txStatusChip,
  txTypeLabelFr
} from './walletUi'
import DateFilterField from '@/components/filters/DateFilterField'

function parseOptionalInt(v: string): number | '' {
  if (v === '') return ''
  const n = Number.parseInt(v, 10)
  return Number.isNaN(n) ? '' : n
}

export default function WalletTransactions() {
  const { lang } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const authUser = useSelector((state: RootState) => state.auth.user)
  const canRead = hasPermission(authUser, 'wallets.read')

  const initialWalletId = Number.parseInt(searchParams.get('wallet_id') || '', 10)
  const initialUserId = Number.parseInt(searchParams.get('user_id') || '', 10)

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<WalletTransaction[]>([])
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)

  const [walletId, setWalletId] = useState<number | ''>(Number.isNaN(initialWalletId) ? '' : initialWalletId)
  const [userId, setUserId] = useState<number | ''>(Number.isNaN(initialUserId) ? '' : initialUserId)
  const [status, setStatus] = useState<WalletTxStatus | ''>('')
  const [type, setType] = useState<WalletTxType | ''>('')
  const [referenceId, setReferenceId] = useState('')
  const [providerTransactionId, setProviderTransactionId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchData = useCallback(async () => {
    if (!canRead) return
    setLoading(true)
    try {
      const res = await walletService.listTransactions(page + 1, perPage, {
        wallet_id: walletId === '' ? undefined : walletId,
        user_id: userId === '' ? undefined : userId,
        status: status === '' ? undefined : status,
        type: type === '' ? undefined : type,
        reference_id: referenceId || undefined,
        provider_transaction_id: providerTransactionId || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined
      })
      setItems(res.data ?? [])
      setTotal(res.pagination?.total ?? 0)
    } catch {
      setItems([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [canRead, page, perPage, walletId, userId, status, type, referenceId, providerTransactionId, dateFrom, dateTo])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  useEffect(() => {
    setPage(0)
  }, [walletId, userId, status, type, referenceId, providerTransactionId, dateFrom, dateTo])

  const resetFilters = () => {
    setWalletId('')
    setUserId('')
    setStatus('')
    setType('')
    setReferenceId('')
    setProviderTransactionId('')
    setDateFrom('')
    setDateTo('')
    setPage(0)
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs items={[{ label: 'Wallets' }, { label: 'Transactions' }]} />
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title='Transactions' subheader='Mouvements de portefeuille (retraits, recharges, transferts…)' />
            {!canRead ? (
              <Box className='p-6'>
                <Typography color='text.secondary'>Permission wallets.read requise.</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ px: 4, pb: 2 }}>
                  {/*
                    Une seule grille : 6 colonnes × largeur égale sur lg (2/12 chaque),
                    puis ligne 2 = Du | Au | Réinitialiser alignés sur les 3 premières colonnes.
                    alignItems: flex-end = même ligne de base (labels + hauteurs variables).
                  */}
                  <Grid container spacing={2} alignItems='flex-end'>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                      <CustomTextField
                        fullWidth
                        size='small'
                        label='ID wallet'
                        type='number'
                        value={walletId === '' ? '' : String(walletId)}
                        onChange={e => setWalletId(parseOptionalInt(e.target.value))}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                      <CustomTextField
                        fullWidth
                        size='small'
                        label='ID utilisateur'
                        type='number'
                        value={userId === '' ? '' : String(userId)}
                        onChange={e => setUserId(parseOptionalInt(e.target.value))}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                      <FormControl size='small' fullWidth>
                        <InputLabel id='tx-filter-status'>Statut</InputLabel>
                        <Select
                          labelId='tx-filter-status'
                          value={status}
                          label='Statut'
                          onChange={e => setStatus(e.target.value as WalletTxStatus | '')}
                        >
                          <MenuItem value=''>Tous</MenuItem>
                          {TX_STATUS_FILTER_OPTIONS.map(o => (
                            <MenuItem key={o.value} value={o.value}>
                              {o.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                      <FormControl size='small' fullWidth>
                        <InputLabel id='tx-filter-type'>Type</InputLabel>
                        <Select
                          labelId='tx-filter-type'
                          value={type}
                          label='Type'
                          onChange={e => setType(e.target.value as WalletTxType | '')}
                        >
                          <MenuItem value=''>Tous</MenuItem>
                          {TX_TYPE_FILTER_OPTIONS.map(o => (
                            <MenuItem key={o.value} value={o.value}>
                              {o.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                      <CustomTextField
                        fullWidth
                        size='small'
                        label='Référence interne'
                        value={referenceId}
                        onChange={e => setReferenceId(e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                      <CustomTextField
                        fullWidth
                        size='small'
                        label='ID transaction prestataire'
                        value={providerTransactionId}
                        onChange={e => setProviderTransactionId(e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                      <DateFilterField label='Du' value={dateFrom} onChange={setDateFrom} fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                      <DateFilterField label='Au' value={dateTo} onChange={setDateTo} fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                      <Button
                        fullWidth
                        variant='outlined'
                        color='secondary'
                        size='small'
                        onClick={resetFilters}
                        sx={{
                          minHeight: 40,
                          boxSizing: 'border-box',
                          textTransform: 'none'
                        }}
                      >
                        Réinitialiser
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                {loading ? (
                  <Box display='flex' justifyContent='center' alignItems='center' minHeight={220}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <div className='overflow-x-auto'>
                      <table className={tableStyles.table}>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Utilisateur</th>
                            <th>Wallet</th>
                            <th>Type</th>
                            <th>Montant</th>
                            <th>Frais</th>
                            <th>Net</th>
                            <th>Statut</th>
                            <th>Référence</th>
                            <th align='right'>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map(tx => (
                            <tr key={tx.id}>
                              <td>{tx.id}</td>
                              <td>{tx.user?.display_name ?? tx.user?.username ?? `#${tx.user_id}`}</td>
                              <td>{tx.wallet_id}</td>
                              <td>{txTypeLabelFr(tx.type)}</td>
                              <td>
                                <MoneyCell value={tx.amount} currency={tx.currency} />
                              </td>
                              <td>
                                <MoneyCell value={tx.fee} currency={tx.currency} />
                              </td>
                              <td>
                                <MoneyCell value={tx.net_amount} currency={tx.currency} />
                              </td>
                              <td>{txStatusChip(tx.status)}</td>
                              <td>
                                <Typography variant='body2' title={tx.reference_id ?? undefined}>
                                  {referenceDisplayFr(tx.reference_id)}
                                </Typography>
                              </td>
                              <td align='right'>
                                <OptionMenu
                                  iconButtonProps={{ size: 'small' }}
                                  options={[
                                    {
                                      text: 'Voir le wallet',
                                      icon: <i className='tabler-wallet' />,
                                      menuItemProps: {
                                        onClick: () =>
                                          router.push(getLocalizedUrl(`/apps/wallets/${tx.wallet_id}`, lang as string))
                                      }
                                    }
                                  ]}
                                />
                              </td>
                            </tr>
                          ))}

                          {items.length === 0 && (
                            <tr>
                              <td colSpan={10} className='text-center text-secondary'>
                                Aucune transaction
                              </td>
                            </tr>
                          )}
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
