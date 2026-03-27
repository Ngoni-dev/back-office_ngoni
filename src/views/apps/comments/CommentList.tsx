'use client'

import { useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import StatusBadge from '@/components/StatusBadge'
import CircularProgress from '@mui/material/CircularProgress'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import MenuItem from '@mui/material/MenuItem'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux-store'
import { hasPermission } from '@/utils/acl'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import tableStyles from '@core/styles/table.module.css'
import CustomTextField from '@core/components/mui/TextField'
import OptionMenu from '@core/components/option-menu'
import { commentService, type VideoComment } from '@/services/comment.service'

export default function CommentList() {
  const authUser = useSelector((state: RootState) => state.auth.user)
  const canRead = hasPermission(authUser, 'comments.read')
  const canWrite = hasPermission(authUser, 'comments.write')

  const [items, setItems] = useState<VideoComment[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [hiddenFilter, setHiddenFilter] = useState<'all' | 'visible' | 'hidden'>('all')
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const fetchData = async () => {
    if (!canRead) return
    setLoading(true)
    try {
      const res = await commentService.list(page + 1, perPage, {
        search: search || undefined,
        ...(hiddenFilter === 'all' ? {} : { is_hidden: hiddenFilter === 'hidden' })
      })
      setItems(res.data ?? [])
      setTotal(res.pagination?.total ?? 0)
      setSelectedIds([])
    } catch {
      setItems([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, perPage, search, hiddenFilter, canRead])

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const allPageSelected = items.length > 0 && items.every(i => selectedSet.has(i.id))

  const toggleOne = (id: number) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  const toggleAllPage = () => {
    if (allPageSelected) {
      setSelectedIds(prev => prev.filter(id => !items.some(i => i.id === id)))
    } else {
      const pageIds = items.map(i => i.id)
      setSelectedIds(prev => [...new Set([...prev, ...pageIds])])
    }
  }

  const moderateOne = async (id: number, action: 'approve' | 'hide' | 'delete') => {
    try {
      await commentService.moderate(id, action)
      toast.success('Commentaire modéré')
      fetchData()
    } catch {
      toast.error('Échec de la modération')
    }
  }

  const resetFilters = () => {
    setSearch('')
    setHiddenFilter('all')
    setPage(0)
  }

  const moderateBulk = async (action: 'approve' | 'hide' | 'delete') => {
    if (selectedIds.length === 0) return
    try {
      await commentService.bulkModerate(selectedIds, action)
      toast.success('Modération en masse effectuée')
      fetchData()
    } catch {
      toast.error('Échec de la modération en masse')
    }
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs items={[{ label: 'Commentaires' }]} />
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title='Commentaires vidéo' subheader='Liste + modération unitaire et en masse' />
            {!canRead ? (
              <Box className='p-6'>
                <Typography color='text.secondary'>Vous n’avez pas la permission de consulter les commentaires.</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ px: 4, pb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <CustomTextField
                    size='small'
                    placeholder='Rechercher commentaire / utilisateur / vidéo...'
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    sx={{ minWidth: 260 }}
                  />
                  <CustomTextField
                    select
                    size='small'
                    label='Visibilité'
                    value={hiddenFilter}
                    onChange={e => setHiddenFilter(e.target.value as 'all' | 'visible' | 'hidden')}
                    sx={{ minWidth: 160 }}
                  >
                    <MenuItem value='all'>Tous</MenuItem>
                    <MenuItem value='visible'>Visibles</MenuItem>
                    <MenuItem value='hidden'>Masqués</MenuItem>
                  </CustomTextField>
                  <Button variant='outlined' color='secondary' size='small' onClick={resetFilters} sx={{ minHeight: 40, textTransform: 'none' }}>
                    Réinitialiser
                  </Button>

                  {canWrite && (
                    <Box sx={{ display: 'flex', gap: 1, ml: { xs: 0, md: 'auto' }, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Button size='small' variant='outlined' disabled={selectedIds.length === 0} onClick={() => moderateBulk('approve')}>
                        Approuver sélection
                      </Button>
                      <Button size='small' color='warning' variant='outlined' disabled={selectedIds.length === 0} onClick={() => moderateBulk('hide')}>
                        Masquer sélection
                      </Button>
                      <Button size='small' color='error' variant='outlined' disabled={selectedIds.length === 0} onClick={() => moderateBulk('delete')}>
                        Supprimer sélection
                      </Button>
                    </Box>
                  )}
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
                            <th>
                              <Checkbox checked={allPageSelected} onChange={toggleAllPage} />
                            </th>
                            <th>ID</th>
                            <th>Commentaire</th>
                            <th>Utilisateur</th>
                            <th>Vidéo</th>
                            <th>Statut</th>
                            <th>Date</th>
                            <th align='right'>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map(item => (
                            <tr key={item.id}>
                              <td>
                                <Checkbox
                                  checked={selectedSet.has(item.id)}
                                  onChange={() => toggleOne(item.id)}
                                />
                              </td>
                              <td>{item.id}</td>
                              <td style={{ maxWidth: 320 }}>
                                <Typography variant='body2' noWrap title={item.body}>{item.body}</Typography>
                              </td>
                              <td>{item.user?.display_name ?? item.user?.username ?? `#${item.user_id}`}</td>
                              <td>{item.video?.title ?? `#${item.video_id}`}</td>
                              <td>
                                <StatusBadge
                                  label={item.is_hidden ? 'Masqué' : 'Visible'}
                                  tone={item.is_hidden ? 'warning' : 'success'}
                                />
                              </td>
                              <td>{item.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR') : '—'}</td>
                              <td align='right'>
                                <OptionMenu
                                  options={[
                                    {
                                      text: 'Approuver',
                                      icon: <i className='tabler-check' />,
                                      menuItemProps: {
                                        onClick: () => moderateOne(item.id, 'approve'),
                                        disabled: !canWrite || !item.is_hidden
                                      }
                                    },
                                    {
                                      text: 'Masquer',
                                      icon: <i className='tabler-eye-off' />,
                                      menuItemProps: {
                                        onClick: () => moderateOne(item.id, 'hide'),
                                        disabled: !canWrite || item.is_hidden
                                      }
                                    },
                                    {
                                      text: 'Supprimer',
                                      icon: <i className='tabler-trash' />,
                                      menuItemProps: {
                                        onClick: () => moderateOne(item.id, 'delete'),
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
