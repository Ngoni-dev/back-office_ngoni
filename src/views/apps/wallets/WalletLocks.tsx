'use client'

import { useCallback, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux-store'
import { hasPermission } from '@/utils/acl'
import { walletService, type WalletLockReason, type WalletLock } from '@/services/wallet.service'
import { useParams } from 'next/navigation'
import DateFilterField from '@/components/filters/DateFilterField'

export default function WalletLocks() {
  const authUser = useSelector((state: RootState) => state.auth.user)
  const canRead = hasPermission(authUser, 'wallets.read')

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<WalletLock[]>([])
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)

  const [userId, setUserId] = useState<number | ''>('')
  const [walletId, setWalletId] = useState<number | ''>('')
  const [reason, setReason] = useState<WalletLockReason | ''>('')
  const [lockedUntilFrom, setLockedUntilFrom] = useState('')
  const [lockedUntilTo, setLockedUntilTo] = useState('')

  const fetchData = useCallback(async () => {
    if (!canRead) return
    setLoading(true)
    try {
      const res = await walletService.listLocks(page + 1, perPage, {
        user_id: userId === '' ? undefined : userId,
        wallet_id: walletId === '' ? undefined : walletId,
        reason: reason === '' ? undefined : reason,
        locked_until_from: lockedUntilFrom || undefined,
        locked_until_to: lockedUntilTo || undefined
      })
      setItems(res.data ?? [])
      setTotal(res.pagination?.total ?? 0)
    } catch {
      setItems([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [canRead, page, perPage, userId, walletId, reason, lockedUntilFrom, lockedUntilTo])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  useEffect(() => {
    setPage(0)
  }, [userId, walletId, reason, lockedUntilFrom, lockedUntilTo])

  const resetFilters = () => {
    setUserId('')
    setWalletId('')
    setReason('')
    setLockedUntilFrom('')
    setLockedUntilTo('')
    setPage(0)
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs items={[{ label: 'Wallets' }, { label: 'Verrous' }]} />
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title='Verrous wallet' subheader='Gestion des verrous (wallet_locks)' />
            {!canRead ? (
              <Box className='p-6'>
                <Typography color='text.secondary'>Permission wallets.read requise.</Typography>
              </Box>
            ) : (
              <Box sx={{ px: 4, pb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end', py: 2 }}>
                  <CustomTextField
                    size='small'
                    label='Wallet ID'
                    value={walletId}
                    onChange={e => setWalletId(e.target.value === '' ? '' : Number.parseInt(e.target.value, 10))}
                    sx={{ minWidth: 140 }}
                  />
                  <CustomTextField
                    size='small'
                    label='User ID'
                    value={userId}
                    onChange={e => setUserId(e.target.value === '' ? '' : Number.parseInt(e.target.value, 10))}
                    sx={{ minWidth: 140 }}
                  />
                  <CustomTextField
                    select
                    size='small'
                    label='Raison'
                    value={reason}
                    onChange={e => setReason(e.target.value as WalletLockReason | '')}
                    sx={{ minWidth: 180 }}
                  >
                    <MenuItem value=''>Toutes</MenuItem>
                    <MenuItem value='PENDING_WITHDRAWAL'>PENDING_WITHDRAWAL</MenuItem>
                    <MenuItem value='DISPUTE'>DISPUTE</MenuItem>
                    <MenuItem value='KYC_PENDING'>KYC_PENDING</MenuItem>
                    <MenuItem value='FRAUD_CHECK'>FRAUD_CHECK</MenuItem>
                    <MenuItem value='ADMIN_LOCK'>ADMIN_LOCK</MenuItem>
                    <MenuItem value='CHARGEBACK'>CHARGEBACK</MenuItem>
                    <MenuItem value='MAINTENANCE'>MAINTENANCE</MenuItem>
                  </CustomTextField>
                  <DateFilterField label='Locked dès' value={lockedUntilFrom} onChange={setLockedUntilFrom} />
                  <DateFilterField label='Locked jusqu’à' value={lockedUntilTo} onChange={setLockedUntilTo} />
                  <Button
                    variant='outlined'
                    color='secondary'
                    size='small'
                    onClick={resetFilters}
                    sx={{ minHeight: 40, textTransform: 'none' }}
                  >
                    Réinitialiser
                  </Button>
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
                            <th>User</th>
                            <th>Wallet</th>
                            <th>Montant</th>
                            <th>Raison</th>
                            <th>Locked until</th>
                            <th>Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map(lk => (
                            <tr key={lk.id}>
                              <td>{lk.id}</td>
                              <td>{lk.user?.display_name ?? lk.user?.username ?? `#${lk.user_id}`}</td>
                              <td>{lk.wallet_id}</td>
                              <td>{lk.locked_amount != null ? Number(lk.locked_amount).toLocaleString('fr-FR') : '—'}</td>
                              <td>{lk.reason}</td>
                              <td>{lk.locked_until ? new Date(lk.locked_until).toLocaleString('fr-FR') : '—'}</td>
                              <td style={{ maxWidth: 420 }}>
                                <Typography variant='body2' noWrap title={lk.description ?? ''}>
                                  {lk.description ?? '—'}
                                </Typography>
                              </td>
                            </tr>
                          ))}
                          {items.length === 0 && (
                            <tr>
                              <td colSpan={7} className='text-center text-secondary'>
                                Aucun verrou
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
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

