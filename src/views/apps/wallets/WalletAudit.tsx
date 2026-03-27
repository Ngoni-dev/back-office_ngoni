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
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux-store'
import { hasPermission } from '@/utils/acl'
import { walletService, type AuditAction, type AuditStatus, type WalletAuditLog } from '@/services/wallet.service'
import { useSearchParams } from 'next/navigation'
import DateFilterField from '@/components/filters/DateFilterField'
import {
  AUDIT_ACTION_OPTIONS,
  AUDIT_STATUS_FILTER_OPTIONS,
  MoneyCell,
  auditActionLabelFr,
  auditStatusChip,
  providerLabelFr
} from './walletUi'

function parseOptionalInt(v: string): number | '' {
  if (v === '') return ''
  const n = Number.parseInt(v, 10)
  return Number.isNaN(n) ? '' : n
}

export default function WalletAudit() {
  const searchParams = useSearchParams()
  const initialUserId = Number.parseInt(searchParams.get('user_id') || '', 10)

  const authUser = useSelector((state: RootState) => state.auth.user)
  const canRead = hasPermission(authUser, 'wallets.read')

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<WalletAuditLog[]>([])
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)

  const [userId, setUserId] = useState<number | ''>(Number.isNaN(initialUserId) ? '' : initialUserId)
  const [action, setAction] = useState<AuditAction | ''>('')
  const [status, setStatus] = useState<AuditStatus | ''>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchData = useCallback(async () => {
    if (!canRead) return
    setLoading(true)
    try {
      const res = await walletService.listAudit(page + 1, perPage, {
        user_id: userId === '' ? undefined : userId,
        action: action === '' ? undefined : action,
        status: status === '' ? undefined : status,
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
  }, [canRead, page, perPage, userId, action, status, dateFrom, dateTo])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  useEffect(() => {
    setPage(0)
  }, [userId, action, status, dateFrom, dateTo])

  const resetFilters = () => {
    setUserId('')
    setAction('')
    setStatus('')
    setDateFrom('')
    setDateTo('')
    setPage(0)
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs items={[{ label: 'Wallets' }, { label: 'Audit' }]} />
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title='Journal d’audit' subheader='Événements financiers et actions sur les portefeuilles' />
            {!canRead ? (
              <Box className='p-6'>
                <Typography color='text.secondary'>Permission wallets.read requise.</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ px: 4, pb: 2 }}>
                  <Grid container spacing={2} alignItems='center'>
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
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <FormControl size='small' fullWidth>
                        <InputLabel>Action</InputLabel>
                        <Select
                          value={action}
                          label='Action'
                          onChange={e => setAction(e.target.value as AuditAction | '')}
                        >
                          <MenuItem value=''>Toutes</MenuItem>
                          {AUDIT_ACTION_OPTIONS.map(o => (
                            <MenuItem key={o.value} value={o.value}>
                              {o.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                      <FormControl size='small' fullWidth>
                        <InputLabel>Statut</InputLabel>
                        <Select
                          value={status}
                          label='Statut'
                          onChange={e => setStatus(e.target.value as AuditStatus | '')}
                        >
                          <MenuItem value=''>Tous</MenuItem>
                          {AUDIT_STATUS_FILTER_OPTIONS.map(o => (
                            <MenuItem key={o.value} value={o.value}>
                              {o.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                      <DateFilterField label='Du' value={dateFrom} onChange={setDateFrom} fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                      <DateFilterField label='Au' value={dateTo} onChange={setDateTo} fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                      <Button fullWidth variant='outlined' color='secondary' onClick={resetFilters}>
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
                            <th>Date</th>
                            <th>Utilisateur</th>
                            <th>Action</th>
                            <th>Statut</th>
                            <th>Montant</th>
                            <th>Canal</th>
                            <th>IP</th>
                            <th>Détails</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map(log => {
                            const metaStr = log.metadata ? JSON.stringify(log.metadata, null, 0) : ''
                            return (
                              <tr key={log.id}>
                                <td>{log.id}</td>
                                <td>{log.created_at ? new Date(log.created_at).toLocaleString('fr-FR') : '—'}</td>
                                <td>{log.user?.display_name ?? log.user?.username ?? (log.user_id ? `#${log.user_id}` : '—')}</td>
                                <td>{auditActionLabelFr(log.action)}</td>
                                <td>{auditStatusChip(log.status)}</td>
                                <td>
                                  <MoneyCell value={log.amount} currency={log.currency} />
                                </td>
                                <td>{providerLabelFr(log.provider)}</td>
                                <td>{log.ip_address ?? '—'}</td>
                                <td style={{ maxWidth: 280 }}>
                                  {metaStr ? (
                                    <Typography
                                      variant='caption'
                                      component='pre'
                                      sx={{
                                        m: 0,
                                        fontFamily: 'ui-monospace, monospace',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        maxHeight: 72,
                                        overflow: 'hidden'
                                      }}
                                      title={metaStr.length > 200 ? metaStr : undefined}
                                    >
                                      {metaStr.length > 180 ? `${metaStr.slice(0, 180)}…` : metaStr}
                                    </Typography>
                                  ) : (
                                    '—'
                                  )}
                                </td>
                              </tr>
                            )
                          })}

                          {items.length === 0 && (
                            <tr>
                              <td colSpan={9} className='text-center text-secondary'>
                                Aucun événement
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
