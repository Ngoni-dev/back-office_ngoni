'use client'

import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import StatusBadge from '@/components/StatusBadge'
import CircularProgress from '@mui/material/CircularProgress'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import { storyService, type Story, type StoryStats } from '@/services/story.service'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux-store'
import { hasPermission } from '@/utils/acl'

export default function StoryList() {
  const authUser = useSelector((state: RootState) => state.auth.user)
  const canRead = hasPermission(authUser, 'stories.read')
  const canWrite = hasPermission(authUser, 'stories.write')

  const [items, setItems] = useState<Story[]>([])
  const [stats, setStats] = useState<StoryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [mediaType, setMediaType] = useState('')
  const [stateFilter, setStateFilter] = useState('')

  const fetchData = async () => {
    if (!canRead) return
    setLoading(true)
    try {
      const [listRes, statsRes] = await Promise.all([
        storyService.list(page + 1, perPage, {
          search: search || undefined,
          media_type: mediaType || undefined,
          state: stateFilter || undefined
        }),
        storyService.stats()
      ])

      setItems(listRes.data ?? [])
      setTotal(listRes.pagination?.total ?? 0)
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
  }, [page, perPage, search, mediaType, stateFilter, canRead])

  const moderateDelete = async (id: number) => {
    const reason = window.prompt('Motif de suppression (obligatoire):', 'Story inappropriée')
    if (!reason || !reason.trim()) return
    try {
      await storyService.moderate(id, reason.trim())
      toast.success('Story supprimée')
      fetchData()
    } catch {
      toast.error('Impossible de supprimer cette story')
    }
  }

  const resetFilters = () => {
    setSearch('')
    setMediaType('')
    setStateFilter('')
    setPage(0)
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs items={[{ label: 'Stories' }]} />
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title='Stories' subheader='Liste + modération + statistiques' />
            {!canRead ? (
              <Box className='p-6'>
                <Typography color='text.secondary'>Vous n’avez pas la permission de consulter les stories.</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ px: 4, pb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <CustomTextField
                    size='small'
                    placeholder='Rechercher story / user...'
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    sx={{ minWidth: 240 }}
                  />
                  <CustomTextField
                    select
                    size='small'
                    label='Type média'
                    value={mediaType}
                    onChange={e => setMediaType(e.target.value)}
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value=''>Tous</MenuItem>
                    <MenuItem value='image'>Image</MenuItem>
                    <MenuItem value='video'>Vidéo</MenuItem>
                  </CustomTextField>
                  <CustomTextField
                    select
                    size='small'
                    label='État'
                    value={stateFilter}
                    onChange={e => setStateFilter(e.target.value)}
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value=''>Tous</MenuItem>
                    <MenuItem value='active'>Actives</MenuItem>
                    <MenuItem value='expired'>Expirées</MenuItem>
                  </CustomTextField>
                  <Button variant='outlined' color='secondary' size='small' onClick={resetFilters} sx={{ minHeight: 40, textTransform: 'none' }}>
                    Réinitialiser
                  </Button>
                </Box>

                {stats && (
                  <Box sx={{ px: 4, pb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <StatusBadge label={`Total: ${stats.total}`} tone='neutral' />
                    <StatusBadge label={`Actives: ${stats.active}`} tone='success' />
                    <StatusBadge label={`Expirées: ${stats.expired}`} tone='neutral' />
                    <StatusBadge label={`Vues: ${stats.views_total}`} tone='info' />
                    <StatusBadge label={`Réponses: ${stats.replies_total}`} tone='warning' />
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
                            <th>Utilisateur</th>
                            <th>Type</th>
                            <th>Caption</th>
                            <th>Vues</th>
                            <th>Expire le</th>
                            <th align='right'>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map(item => (
                            <tr key={item.id}>
                              <td>{item.id}</td>
                              <td>{item.user?.display_name ?? item.user?.username ?? `#${item.user_id}`}</td>
                              <td>{item.media_type}</td>
                              <td style={{ maxWidth: 320 }}>
                                <Typography variant='body2' noWrap title={item.caption ?? ''}>{item.caption ?? '—'}</Typography>
                              </td>
                              <td>{item.views_count ?? 0}</td>
                              <td>{item.expires_at ? new Date(item.expires_at).toLocaleString('fr-FR') : '—'}</td>
                              <td align='right'>
                                <OptionMenu
                                  options={[
                                    {
                                      text: 'Supprimer story',
                                      icon: <i className='tabler-trash' />,
                                      menuItemProps: {
                                        onClick: () => moderateDelete(item.id),
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
