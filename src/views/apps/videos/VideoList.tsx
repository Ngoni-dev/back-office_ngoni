'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import StatusBadge from '@/components/StatusBadge'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import { videoService, type Video } from '@/services/video.service'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux-store'
import { hasPermission } from '@/utils/acl'
import Button from '@mui/material/Button'
import { getLocalizedUrl } from '@/utils/i18n'
import type { VideoAggregatedStats } from '@/services/video.service'
import OptionMenu from '@core/components/option-menu'
import { toast } from 'react-toastify'

export default function VideoList() {
  const { lang } = useParams()
  const router = useRouter()
  const authUser = useSelector((state: RootState) => state.auth.user)
  const canRead = hasPermission(authUser, 'video.read')
  const canWrite = hasPermission(authUser, 'video.write')
  const [items, setItems] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [moderationStatus, setModerationStatus] = useState('')
  const [stats, setStats] = useState<VideoAggregatedStats | null>(null)

  const fetchData = async () => {
    if (!canRead) return
    setLoading(true)
    try {
      const res = await videoService.list(page + 1, perPage, {
        search: search || undefined,
        status: status || undefined,
        moderation_status: moderationStatus || undefined
      })
      setItems(res.data ?? [])
      setTotal(res.pagination?.total ?? 0)
      const statsRes = await videoService.statsAggregated()
      setStats(statsRes.data ?? null)
    } catch {
      setItems([])
      setTotal(0)
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, perPage, search, status, moderationStatus, canRead])

  const moderate = async (id: number, moderation_status: 'approved' | 'rejected' | 'pending') => {
    try {
      await videoService.moderate(id, { moderation_status })
      toast.success('Modération mise à jour')
      fetchData()
    } catch {
      toast.error('Échec de la modération')
    }
  }

  const toggleSensitive = async (video: Video) => {
    try {
      await videoService.updateFlags(video.id, { is_sensitive: !video.is_sensitive })
      toast.success('Flag sensible mis à jour')
      fetchData()
    } catch {
      toast.error('Échec mise à jour du flag sensible')
    }
  }

  const toggleCopyright = async (video: Video) => {
    try {
      await videoService.updateFlags(video.id, { is_copyright_violation: !video.is_copyright_violation })
      toast.success('Flag copyright mis à jour')
      fetchData()
    } catch {
      toast.error('Échec mise à jour du flag copyright')
    }
  }

  const resetFilters = () => {
    setSearch('')
    setStatus('')
    setModerationStatus('')
    setPage(0)
  }

  const removeVideo = async (video: Video) => {
    const reason = window.prompt('Motif de suppression (obligatoire):', 'Contenu non conforme')
    if (!reason || !reason.trim()) return
    try {
      await videoService.delete(video.id, reason.trim())
      toast.success('Vidéo supprimée')
      fetchData()
    } catch {
      toast.error('Impossible de supprimer cette vidéo')
    }
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs items={[{ label: 'Vidéos' }]} />
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title='Vidéos'
              subheader='Liste des vidéos de la plateforme'
              action={
                <Button variant='contained' onClick={() => router.push(getLocalizedUrl('/apps/videos/moderation', lang as string))}>
                  File de modération
                </Button>
              }
            />
            {!canRead ? (
              <Box className='p-6'>
                <Typography color='text.secondary'>Vous n’avez pas la permission de consulter les vidéos.</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ px: 4, pb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <CustomTextField
                    size='small'
                    placeholder='Rechercher titre/description...'
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    sx={{ minWidth: 240 }}
                  />
                  <FormControl size='small' sx={{ minWidth: 150 }}>
                    <InputLabel>Statut</InputLabel>
                    <Select value={status} label='Statut' onChange={e => setStatus(e.target.value)}>
                      <MenuItem value=''>Tous</MenuItem>
                      <MenuItem value='processing'>processing</MenuItem>
                      <MenuItem value='published'>published</MenuItem>
                      <MenuItem value='rejected'>rejected</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size='small' sx={{ minWidth: 180 }}>
                    <InputLabel>Modération</InputLabel>
                    <Select value={moderationStatus} label='Modération' onChange={e => setModerationStatus(e.target.value)}>
                      <MenuItem value=''>Tous</MenuItem>
                      <MenuItem value='pending'>pending</MenuItem>
                      <MenuItem value='approved'>approved</MenuItem>
                      <MenuItem value='rejected'>rejected</MenuItem>
                    </Select>
                  </FormControl>
                  <Button variant='outlined' color='secondary' size='small' onClick={resetFilters} sx={{ minHeight: 40, textTransform: 'none' }}>
                    Réinitialiser
                  </Button>
                </Box>
                {stats && (
                  <Box sx={{ px: 4, pb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <StatusBadge label={`Total: ${stats.total}`} tone='neutral' />
                    <StatusBadge label={`En attente modération: ${stats.moderation_pending}`} tone='warning' />
                    <StatusBadge label={`Sensibles: ${stats.sensitive}`} tone='warning' />
                    <StatusBadge label={`Copyright: ${stats.copyright_violations}`} tone='warning' />
                    <StatusBadge label={`Signalées: ${stats.reported}`} tone='warning' />
                    <StatusBadge label={`Supprimées: ${stats.deleted_total}`} tone='neutral' />
                  </Box>
                )}
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
                            <th>Titre</th>
                            <th>Auteur</th>
                            <th>Statut</th>
                            <th>Modération</th>
                            <th>Signalée</th>
                            <th>Date</th>
                            <th align='right'>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map(v => (
                            <tr key={v.id}>
                              <td>{v.id}</td>
                              <td>{v.title}</td>
                              <td>{v.user?.display_name ?? v.user?.username ?? `#${v.user_id}`}</td>
                              <td>{v.status ?? '—'}</td>
                              <td>{v.moderation_status ?? '—'}</td>
                              <td>
                                <StatusBadge label={v.is_reported ? 'Oui' : 'Non'} tone={v.is_reported ? 'warning' : 'neutral'} />
                              </td>
                              <td>{v.created_at ? new Date(v.created_at).toLocaleDateString('fr-FR') : '—'}</td>
                              <td align='right'>
                                <OptionMenu
                                  options={[
                                    {
                                      text: 'Détail',
                                      icon: <i className='tabler-eye' />,
                                      menuItemProps: {
                                        onClick: () => router.push(getLocalizedUrl(`/apps/videos/${v.id}`, lang as string))
                                      }
                                    },
                                    { divider: true },
                                    {
                                      text: 'Approuver',
                                      icon: <i className='tabler-check' />,
                                      menuItemProps: {
                                        onClick: () => moderate(v.id, 'approved'),
                                        disabled: !canWrite || v.moderation_status === 'approved'
                                      }
                                    },
                                    {
                                      text: 'Rejeter',
                                      icon: <i className='tabler-x' />,
                                      menuItemProps: {
                                        onClick: () => moderate(v.id, 'rejected'),
                                        disabled: !canWrite || v.moderation_status === 'rejected'
                                      }
                                    },
                                    {
                                      text: 'Remettre en attente',
                                      icon: <i className='tabler-clock' />,
                                      menuItemProps: {
                                        onClick: () => moderate(v.id, 'pending'),
                                        disabled: !canWrite || v.moderation_status === 'pending'
                                      }
                                    },
                                    { divider: true },
                                    {
                                      text: v.is_sensitive ? 'Retirer sensible' : 'Marquer sensible',
                                      icon: <i className='tabler-alert-triangle' />,
                                      menuItemProps: {
                                        onClick: () => toggleSensitive(v),
                                        disabled: !canWrite
                                      }
                                    },
                                    {
                                      text: v.is_copyright_violation ? 'Retirer copyright' : 'Marquer copyright',
                                      icon: <i className='tabler-copyright' />,
                                      menuItemProps: {
                                        onClick: () => toggleCopyright(v),
                                        disabled: !canWrite
                                      }
                                    },
                                    {
                                      text: 'Supprimer (soft)',
                                      icon: <i className='tabler-trash' />,
                                      menuItemProps: {
                                        onClick: () => removeVideo(v),
                                        disabled: !canWrite,
                                        className: 'text-error'
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
