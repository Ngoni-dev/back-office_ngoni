'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import CustomTextField from '@core/components/mui/TextField'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import { useParams, useRouter } from 'next/navigation'
import { getLocalizedUrl } from '@/utils/i18n'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux-store'
import { hasPermission } from '@/utils/acl'
import { toast } from 'react-toastify'
import { walletService, type Wallet, type WalletDetailResponse } from '@/services/wallet.service'
import { MoneyBlock, walletStatusChip } from './walletUi'

export default function WalletDetail() {
  const params = useParams()
  const lang = (params as { lang?: string }).lang
  const router = useRouter()
  const authUser = useSelector((state: RootState) => state.auth.user)

  const canRead = hasPermission(authUser, 'wallets.read')
  const canWrite = hasPermission(authUser, 'wallets.write')

  const walletIdRaw = (params as { id?: string }).id
  const walletId = useMemo(() => {
    const raw = walletIdRaw
    if (!raw) return null
    const n = Number.parseInt(raw, 10)
    return Number.isNaN(n) ? null : n
  }, [walletIdRaw])

  const [loading, setLoading] = useState(true)
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [metaTxCount, setMetaTxCount] = useState(0)
  const [metaLocksCount, setMetaLocksCount] = useState(0)

  const [actionOpen, setActionOpen] = useState(false)
  const [actionType, setActionType] = useState<'freeze' | 'unfreeze'>('freeze')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    if (!canRead || walletId == null) return
    setLoading(true)
    try {
      const res: WalletDetailResponse = await walletService.get(walletId)
      setWallet(res.data?.wallet ?? null)
      setMetaTxCount(res.data?.meta?.transactions_count ?? 0)
      setMetaLocksCount(res.data?.meta?.locks_count ?? 0)
    } catch {
      setWallet(null)
      setMetaTxCount(0)
      setMetaLocksCount(0)
    } finally {
      setLoading(false)
    }
  }, [canRead, walletId])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const openAction = (type: 'freeze' | 'unfreeze') => {
    setActionType(type)
    setReason('')
    setActionOpen(true)
  }

  const submitAction = async () => {
    if (walletId == null) return
    if (!reason.trim()) return

    setSubmitting(true)
    try {
      if (actionType === 'freeze') {
        await walletService.freeze(walletId, reason.trim())
        toast.success('Wallet gelé')
      } else {
        await walletService.unfreeze(walletId, reason.trim())
        toast.success('Wallet dégelé')
      }
      setActionOpen(false)
      await fetchData()
    } catch {
      toast.error('Action impossible')
    } finally {
      setSubmitting(false)
    }
  }

  const userLabel = wallet
    ? wallet.user?.display_name ?? wallet.user?.username ?? `Utilisateur #${wallet.user_id}`
    : ''

  if (!canRead) {
    return (
      <Box sx={{ width: '100%', minWidth: 0 }}>
        <NgoniBreadcrumbs items={[{ label: 'Wallets' }, { label: 'Détail' }]} />
        <Box className='p-6'>
          <Typography color='text.secondary'>Vous n’avez pas la permission de consulter ce wallet.</Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs items={[{ label: 'Wallets' }, { label: walletId ? `#${walletId}` : 'Détail' }]} />
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title={
                wallet ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
                    <span>Wallet #{wallet.id}</span>
                    {walletStatusChip(wallet.status)}
                  </Box>
                ) : (
                  'Wallet'
                )
              }
              subheader={
                wallet ? (
                  <Typography variant='body2' color='text.secondary' component='span'>
                    {userLabel}
                  </Typography>
                ) : (
                  'Chargement…'
                )
              }
              action={
                wallet && canWrite ? (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {wallet.status === 'ACTIVE' ? (
                      <Button variant='contained' color='warning' onClick={() => openAction('freeze')}>
                        Geler le wallet
                      </Button>
                    ) : (
                      <Button variant='contained' color='success' onClick={() => openAction('unfreeze')}>
                        Dégeler le wallet
                      </Button>
                    )}
                    <Button
                      variant='outlined'
                      onClick={() =>
                        router.push(getLocalizedUrl(`/apps/wallets/transactions?wallet_id=${wallet.id}`, lang as string))
                      }
                    >
                      Transactions
                    </Button>
                  </Box>
                ) : null
              }
            />
            <CardContent sx={{ pt: 0 }}>
              {loading ? (
                <Box display='flex' justifyContent='center' alignItems='center' minHeight={240}>
                  <CircularProgress />
                </Box>
              ) : wallet ? (
                <>
                  <Paper variant='outlined' sx={{ p: 2.5, mb: 3, bgcolor: 'action.hover', borderColor: 'divider' }}>
                    <Typography variant='overline' color='text.secondary' sx={{ letterSpacing: 1 }}>
                      Synthèse
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 1 }}>
                      <Typography variant='body2' color='text.secondary'>
                        Transactions enregistrées :{' '}
                        <Typography component='span' fontWeight={700} color='text.primary'>
                          {metaTxCount}
                        </Typography>
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Verrous actifs :{' '}
                        <Typography component='span' fontWeight={700} color='text.primary'>
                          {metaLocksCount}
                        </Typography>
                      </Typography>
                    </Box>
                  </Paper>

                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Paper variant='outlined' sx={{ p: 2.5, height: '100%', borderColor: 'divider' }}>
                        <MoneyBlock label='Solde disponible' value={wallet.balance} emphasized />
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Paper variant='outlined' sx={{ p: 2.5, height: '100%', borderColor: 'divider' }}>
                        <MoneyBlock label='Solde en attente' value={wallet.pending_balance} emphasized />
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Paper variant='outlined' sx={{ p: 2.5, height: '100%', borderColor: 'divider' }}>
                        <MoneyBlock label='Total gagné' value={wallet.total_earned} emphasized />
                      </Paper>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant='subtitle2' sx={{ mb: 2 }}>
                        Plafonds et conformité
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Paper variant='outlined' sx={{ p: 2, borderColor: 'divider' }}>
                            <MoneyBlock label='Plafond quotidien' value={wallet.daily_limit} />
                          </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Paper variant='outlined' sx={{ p: 2, borderColor: 'divider' }}>
                            <MoneyBlock label='Plafond mensuel' value={wallet.monthly_limit} />
                          </Paper>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Paper variant='outlined' sx={{ p: 2, borderColor: 'divider' }}>
                            <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 0.5 }}>
                              Motif de gel ou suspension
                            </Typography>
                            <Typography variant='body2' sx={{ wordBreak: 'break-word' }}>
                              {wallet.frozen_reason ?? '—'}
                            </Typography>
                            <Typography variant='caption' color='text.secondary' display='block' sx={{ mt: 1 }}>
                              {wallet.frozen_at
                                ? `Le ${new Date(wallet.frozen_at).toLocaleString('fr-FR')}`
                                : 'Aucune date'}
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 4, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    <Button
                      variant='outlined'
                      startIcon={<i className='tabler-lock' />}
                      onClick={() =>
                        router.push(getLocalizedUrl(`/apps/wallets/locks?wallet_id=${wallet.id}`, lang as string))
                      }
                    >
                      Verrous
                    </Button>
                    <Button
                      variant='outlined'
                      startIcon={<i className='tabler-history' />}
                      onClick={() =>
                        router.push(getLocalizedUrl(`/apps/wallets/audit?user_id=${wallet.user_id}`, lang as string))
                      }
                    >
                      Journal d’audit
                    </Button>
                  </Box>
                </>
              ) : (
                <Typography color='text.secondary'>Wallet introuvable.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={actionOpen} onClose={() => (submitting ? undefined : setActionOpen(false))} maxWidth='sm' fullWidth>
        <DialogTitle>{actionType === 'freeze' ? 'Geler le wallet' : 'Dégeler le wallet'}</DialogTitle>
        <DialogContent>
          <CustomTextField
            autoFocus
            fullWidth
            label='Motif (obligatoire)'
            value={reason}
            onChange={e => setReason(e.target.value)}
            multiline
            rows={3}
            sx={{ mt: 1 }}
          />
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
            Le motif sera enregistré dans le journal d’audit.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionOpen(false)} disabled={submitting}>
            Annuler
          </Button>
          <Button
            variant='contained'
            color={actionType === 'freeze' ? 'warning' : 'success'}
            onClick={() => void submitAction()}
            disabled={submitting || !reason.trim()}
          >
            {submitting ? 'Traitement…' : actionType === 'freeze' ? 'Geler' : 'Dégeler'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
