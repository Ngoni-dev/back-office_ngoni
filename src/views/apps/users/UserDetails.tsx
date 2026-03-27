'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import StatusBadge, { toneFromLegacyChipColor } from '@/components/StatusBadge'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'

import { userService, type User } from '@/services/user.service'
import { getLocalizedUrl } from '@/utils/i18n'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import tableStyles from '@core/styles/table.module.css'

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

const SUBSCRIPTION_STATUS_COLORS: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  ACTIVE: 'success',
  TRIAL: 'info',
  PAST_DUE: 'warning',
  CANCELLED: 'default',
  EXPIRED: 'error'
}

const TX_STATUS_COLORS: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  SUCCESS: 'success',
  COMPLETED: 'success',
  PENDING: 'warning',
  FAILED: 'error',
  REJECTED: 'error'
}

const VIDEO_STATUS_COLORS: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  APPROVED: 'success',
  PENDING: 'warning',
  REJECTED: 'error'
}

function safeDate(value?: string | null) {
  return value ? new Date(value).toLocaleString('fr-FR') : '—'
}

function money(value: unknown) {
  if (value === null || value === undefined || value === '') return '—'
  const n = Number(value)
  return Number.isFinite(n) ? n.toLocaleString('fr-FR') : '—'
}

export default function UserDetails() {
  const router = useRouter()
  const { lang, id } = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<{ videos_count: number; subscriptions_count: number; transactions_count: number; active_sessions_count: number }>({
    videos_count: 0,
    subscriptions_count: 0,
    transactions_count: 0,
    active_sessions_count: 0
  })
  const [wallet, setWallet] = useState<Record<string, any> | null>(null)
  const [recentVideos, setRecentVideos] = useState<Array<{ id: number; title?: string | null; moderation_status?: string | null; created_at?: string | null }>>([])
  const [recentSubscriptions, setRecentSubscriptions] = useState<Array<Record<string, unknown>>>([])
  const [recentTransactions, setRecentTransactions] = useState<Array<{ id: number; type?: string | null; amount?: number | string | null; net_amount?: number | string | null; currency?: string | null; status?: string | null; reference_id?: string | null; created_at?: string | null }>>([])
  const [activeSessions, setActiveSessions] = useState<Array<{ id: string; ip_address?: string | null; user_agent?: string | null; last_activity_at?: string | null }>>([])
  const [kycDocs, setKycDocs] = useState<Array<{ id: number; document_type: string; status: string; created_at?: string }>>([])
  const [certs, setCerts] = useState<Array<{ id: number; status: string; has_certified_badge?: boolean; submitted_at?: string | null }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      setLoading(true)
      userService
        .get(Number(id))
        .then(res => {
          setUser(res.data.user)
          setStats(res.data.stats ?? { videos_count: 0, subscriptions_count: 0, transactions_count: 0, active_sessions_count: 0 })
          setWallet((res.data.wallet as Record<string, any>) ?? null)
          setRecentVideos(res.data.recent_videos ?? [])
          setRecentSubscriptions(res.data.recent_subscriptions ?? [])
          setRecentTransactions(res.data.recent_transactions ?? [])
          setActiveSessions(res.data.active_sessions ?? [])
        })
        .catch(() => {
          setUser(null)
          setWallet(null)
          setRecentVideos([])
          setRecentSubscriptions([])
          setRecentTransactions([])
          setActiveSessions([])
        })
        .finally(() => setLoading(false))

      userService
        .kycHistory(Number(id))
        .then(res => {
          setKycDocs(res.data.kyc_documents ?? [])
          setCerts(res.data.certifications ?? [])
        })
        .catch(() => {
          setKycDocs([])
          setCerts([])
        })
    }
  }, [id])

  if (loading || !user) {
    return (
      <Box display='flex' justifyContent='center' py={8}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs
        items={[
          { label: 'Utilisateurs', href: getLocalizedUrl('/apps/users', lang as string) },
          { label: user.display_name ?? user.username }
        ]}
      />
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title='Fiche utilisateur'
              action={
                <Button variant='tonal' onClick={() => router.push(getLocalizedUrl('/apps/users', lang as string))}>
                  Retour
                </Button>
              }
            />
            <CardContent>
              <Box display='flex' alignItems='center' justifyContent='space-between' gap={3} mb={4} flexWrap='wrap'>
                <Box display='flex' alignItems='center' gap={3}>
                <Avatar
                  src={user.avatar_url ?? undefined}
                  sx={{ width: 80, height: 80 }}
                >
                  {(user.display_name ?? user.username).charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant='h6'>{user.display_name ?? user.username}</Typography>
                  <Typography variant='body2' color='text.secondary'>@{user.username}</Typography>
                  <Box display='flex' gap={1} mt={1}>
                    <StatusBadge label={ROLE_LABELS[user.role] ?? user.role} tone='primary' />
                    <StatusBadge
                      label={STATUS_LABELS[user.status] ?? user.status}
                      tone={user.status === 'ACTIVE' ? 'success' : user.status === 'BANNED' ? 'error' : 'neutral'}
                    />
                  </Box>
                </Box>
                </Box>
                <Stack direction='row' spacing={2} useFlexGap flexWrap='wrap'>
                  <Button variant='outlined' size='small' onClick={() => router.push(getLocalizedUrl('/apps/wallets', lang as string))}>
                    Voir wallet
                  </Button>
                  <Button variant='outlined' size='small' onClick={() => router.push(getLocalizedUrl('/apps/wallets/transactions', lang as string))}>
                    Voir transactions
                  </Button>
                  <Button variant='outlined' size='small' onClick={() => router.push(getLocalizedUrl('/apps/videos', lang as string))}>
                    Voir vidéos
                  </Button>
                </Stack>
              </Box>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card variant='outlined'>
                    <CardContent>
                      <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 2 }}>
                        Informations générales
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant='caption' color='text.secondary'>Téléphone</Typography>
                          <Typography variant='body2'>{user.phone_number ?? '—'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant='caption' color='text.secondary'>Pays</Typography>
                          <Typography variant='body2'>{user.country?.name ?? '—'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant='caption' color='text.secondary'>Ville</Typography>
                          <Typography variant='body2'>{user.city ?? '—'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant='caption' color='text.secondary'>KYC</Typography>
                          <Typography variant='body2'>{user.kyc_status ?? '—'}</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card variant='outlined'>
                    <CardContent>
                      <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 2 }}>
                        Statistiques profil
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant='caption' color='text.secondary'>Followers</Typography>
                          <Typography variant='h6'>{user.followers_count ?? 0}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant='caption' color='text.secondary'>Inscription</Typography>
                          <Typography variant='body2'>
                            {user.created_at ? new Date(user.created_at).toLocaleString('fr-FR') : '—'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant='caption' color='text.secondary'>Vidéos</Typography>
                          <Typography variant='h6'>{stats.videos_count}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant='caption' color='text.secondary'>Abonnements</Typography>
                          <Typography variant='h6'>{stats.subscriptions_count}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant='caption' color='text.secondary'>Transactions</Typography>
                          <Typography variant='h6'>{stats.transactions_count}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant='caption' color='text.secondary'>Sessions actives</Typography>
                          <Typography variant='h6'>{stats.active_sessions_count}</Typography>
                        </Grid>
                      </Grid>
                      {user.bio && (
                        <>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant='caption' color='text.secondary'>Bio</Typography>
                          <Typography variant='body2'>{user.bio}</Typography>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Grid container spacing={3}>
                    {[
                      { label: 'Followers', value: user.followers_count ?? 0 },
                      { label: 'Vidéos', value: stats.videos_count },
                      { label: 'Abonnements', value: stats.subscriptions_count },
                      { label: 'Transactions', value: stats.transactions_count },
                      { label: 'Sessions actives', value: stats.active_sessions_count }
                    ].map(item => (
                      <Grid key={item.label} size={{ xs: 6, md: 4, lg: 3 }}>
                        <Card variant='outlined' sx={{ bgcolor: 'action.hover' }}>
                          <CardContent sx={{ py: 2.5 }}>
                            <Typography variant='caption' color='text.secondary'>{item.label}</Typography>
                            <Typography variant='h6'>{item.value}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Card variant='outlined'>
                    <CardHeader title='Wallet' />
                    <CardContent>
                      {wallet ? (
                        <Grid container spacing={3}>
                          <Grid size={{ xs: 6, md: 3 }}>
                            <Typography variant='caption' color='text.secondary'>Statut</Typography>
                            <StatusBadge
                              label={String(wallet.status ?? '—')}
                              tone={String(wallet.status ?? '').toUpperCase() === 'ACTIVE' ? 'success' : 'neutral'}
                            />
                          </Grid>
                          <Grid size={{ xs: 6, md: 3 }}>
                            <Typography variant='caption' color='text.secondary'>Solde</Typography>
                            <Typography variant='body2'>{money(wallet.balance)}</Typography>
                          </Grid>
                          <Grid size={{ xs: 6, md: 3 }}>
                            <Typography variant='caption' color='text.secondary'>En attente</Typography>
                            <Typography variant='body2'>{money(wallet.pending_balance)}</Typography>
                          </Grid>
                          <Grid size={{ xs: 6, md: 3 }}>
                            <Typography variant='caption' color='text.secondary'>Total gagné</Typography>
                            <Typography variant='body2'>{money(wallet.total_earned)}</Typography>
                          </Grid>
                        </Grid>
                      ) : (
                        <Typography variant='body2' color='text.secondary'>Aucun wallet</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Card variant='outlined'>
                    <CardHeader title='Vidéos récentes' />
                    <CardContent>
                      {recentVideos.length === 0 ? (
                        <Typography variant='body2' color='text.secondary'>Aucune vidéo</Typography>
                      ) : (
                        <div className='overflow-x-auto'>
                          <table className={tableStyles.table}>
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Titre</th>
                                <th>Modération</th>
                                <th>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recentVideos.map(v => (
                                <tr key={v.id}>
                                  <td>#{v.id}</td>
                                  <td>{v.title ?? '—'}</td>
                                  <td>
                                    <StatusBadge
                                      label={v.moderation_status ?? '—'}
                                      tone={toneFromLegacyChipColor(VIDEO_STATUS_COLORS[String(v.moderation_status ?? '').toUpperCase()] ?? 'default')}
                                    />
                                  </td>
                                  <td>{safeDate(v.created_at)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Card variant='outlined'>
                    <CardHeader title='Abonnements récents' />
                    <CardContent>
                      {recentSubscriptions.length === 0 ? (
                        <Typography variant='body2' color='text.secondary'>Aucun abonnement</Typography>
                      ) : (
                        <div className='overflow-x-auto'>
                          <table className={tableStyles.table}>
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Plan</th>
                                <th>Statut</th>
                                <th>Début</th>
                                <th>Fin</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recentSubscriptions.map((s, idx) => {
                                const idValue = s.id ?? s.subscription_id ?? idx
                                const status = String(s.status ?? '—')
                                const plan = String(s.plan_name ?? s.plan_code ?? s.plan_id ?? '—')
                                const start = String(s.started_at ?? s.start_date ?? s.created_at ?? '')
                                const end = String(s.ends_at ?? s.end_date ?? s.expires_at ?? '')

                                return (
                                  <tr key={String(idValue)}>
                                    <td>#{String(idValue)}</td>
                                    <td>{plan}</td>
                                    <td>
                                      <StatusBadge
                                        label={status}
                                        tone={toneFromLegacyChipColor(SUBSCRIPTION_STATUS_COLORS[status.toUpperCase()] ?? 'default')}
                                      />
                                    </td>
                                    <td>{safeDate(start || null)}</td>
                                    <td>{safeDate(end || null)}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Card variant='outlined'>
                    <CardHeader title='Transactions récentes' />
                    <CardContent>
                      {recentTransactions.length === 0 ? (
                        <Typography variant='body2' color='text.secondary'>Aucune transaction</Typography>
                      ) : (
                        <div className='overflow-x-auto'>
                          <table className={tableStyles.table}>
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Type</th>
                                <th>Statut</th>
                                <th>Montant</th>
                                <th>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recentTransactions.map(t => (
                                <tr key={t.id}>
                                  <td>#{t.id}</td>
                                  <td>{t.type ?? '—'}</td>
                                  <td>
                                    <StatusBadge
                                      label={t.status ?? '—'}
                                      tone={toneFromLegacyChipColor(TX_STATUS_COLORS[String(t.status ?? '').toUpperCase()] ?? 'default')}
                                    />
                                  </td>
                                  <td>{t.net_amount != null ? money(t.net_amount) : money(t.amount)} {t.currency ?? ''}</td>
                                  <td>{safeDate(t.created_at)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Card variant='outlined'>
                    <CardHeader title='Sessions actives' />
                    <CardContent>
                      {activeSessions.length === 0 ? (
                        <Typography variant='body2' color='text.secondary'>Aucune session active</Typography>
                      ) : (
                        <div className='overflow-x-auto'>
                          <table className={tableStyles.table}>
                            <thead>
                              <tr>
                                <th>Session</th>
                                <th>IP</th>
                                <th>User Agent</th>
                                <th>Dernière activité</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeSessions.map(s => (
                                <tr key={s.id}>
                                  <td>{s.id}</td>
                                  <td>{s.ip_address ?? '—'}</td>
                                  <td>{s.user_agent ?? '—'}</td>
                                  <td>{s.last_activity_at ?? '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Card variant='outlined'>
                    <CardHeader title='Historique KYC' />
                    <CardContent>
                      {kycDocs.length === 0 ? (
                        <Typography variant='body2' color='text.secondary'>Aucun document KYC</Typography>
                      ) : (
                        <div className='overflow-x-auto'>
                          <table className={tableStyles.table}>
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Type</th>
                                <th>Statut</th>
                                <th>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {kycDocs.map(doc => (
                                <tr key={doc.id}>
                                  <td>#{doc.id}</td>
                                  <td>{doc.document_type}</td>
                                  <td>{doc.status}</td>
                                  <td>{doc.created_at ? new Date(doc.created_at).toLocaleString('fr-FR') : '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Card variant='outlined'>
                    <CardHeader title='Historique Certifications' />
                    <CardContent>
                      {certs.length === 0 ? (
                        <Typography variant='body2' color='text.secondary'>Aucune demande de certification</Typography>
                      ) : (
                        <div className='overflow-x-auto'>
                          <table className={tableStyles.table}>
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Statut</th>
                                <th>Badge</th>
                                <th>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {certs.map(cert => (
                                <tr key={cert.id}>
                                  <td>#{cert.id}</td>
                                  <td>{cert.status}</td>
                                  <td>{cert.has_certified_badge ? 'Oui' : 'Non'}</td>
                                  <td>{cert.submitted_at ? new Date(cert.submitted_at).toLocaleString('fr-FR') : '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
