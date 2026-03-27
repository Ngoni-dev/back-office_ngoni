'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import StatusBadge from '@/components/StatusBadge'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Tab from '@mui/material/Tab'
import TablePagination from '@mui/material/TablePagination'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import { alpha, useTheme } from '@mui/material/styles'
import type { ApexOptions } from 'apexcharts'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import {
  hashtagService,
  type CommentHashtagLink,
  type HashtagRecord,
  type VideoHashtagLink
} from '@/services/hashtag.service'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux-store'
import { hasPermission } from '@/utils/acl'
import { displayHashtagLabel } from './hashtagUi'
import DateFilterField from '@/components/filters/DateFilterField'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

type HashtagHubRanking = {
  hashtag_id: number
  hashtag_label: string
  region: string | null
  usage_sum: number
  views_sum: number
  last_date: string | null
}

export default function HashtagHub() {
  const theme = useTheme()
  const authUser = useSelector((state: RootState) => state.auth.user)
  const canRead = hasPermission(authUser, 'hashtags.read')
  const canWrite = hasPermission(authUser, 'hashtags.write')

  const [tab, setTab] = useState(0)
  const [items, setItems] = useState<HashtagRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<number[]>([])
  const [editOpen, setEditOpen] = useState(false)
  const [editTargetId, setEditTargetId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createLabel, setCreateLabel] = useState('')
  const [mergeOpen, setMergeOpen] = useState(false)
  const [mergeKeepId, setMergeKeepId] = useState<number | ''>('')

  const [trendsRegion, setTrendsRegion] = useState('')
  const [trendsFrom, setTrendsFrom] = useState('')
  const [trendsTo, setTrendsTo] = useState('')
  const [trendsRankings, setTrendsRankings] = useState<HashtagHubRanking[]>([])
  const [trendsMeta, setTrendsMeta] = useState<{ table_missing?: boolean } | null>(null)
  const [trendsRankingsLoading, setTrendsRankingsLoading] = useState(false)
  const [evolChartLoading, setEvolChartLoading] = useState(false)
  const [hashtagPickerOptions, setHashtagPickerOptions] = useState<HashtagRecord[]>([])
  const [evolHashtagId, setEvolHashtagId] = useState('')
  const [evolSeries, setEvolSeries] = useState<Array<{ date: string; usage_count: number; views_count: number }>>([])

  const [assocHashtagId, setAssocHashtagId] = useState('')
  const [vidLinks, setVidLinks] = useState<VideoHashtagLink[]>([])
  const [cmtLinks, setCmtLinks] = useState<CommentHashtagLink[]>([])
  const [vidPage, setVidPage] = useState(0)
  const [cmtPage, setCmtPage] = useState(0)
  const [vidPerPage, setVidPerPage] = useState(10)
  const [cmtPerPage, setCmtPerPage] = useState(10)
  const [vidTotal, setVidTotal] = useState(0)
  const [cmtTotal, setCmtTotal] = useState(0)
  const [assocLoading, setAssocLoading] = useState(false)

  const fetchList = useCallback(async () => {
    if (!canRead) return
    setLoading(true)
    try {
      const res = await hashtagService.list(page + 1, perPage, { search: search || undefined })
      setItems(res.data ?? [])
      setTotal(res.pagination?.total ?? 0)
    } catch {
      setItems([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [canRead, page, perPage, search])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  useEffect(() => {
    setPage(0)
  }, [search])

  useEffect(() => {
    setSelected([])
  }, [page, perPage, search])

  const fetchTrendsRankings = async () => {
    if (!canRead) return
    setTrendsRankingsLoading(true)
    try {
      const res = await hashtagService.trends({
        region: trendsRegion || undefined,
        date_from: trendsFrom || undefined,
        date_to: trendsTo || undefined,
        limit: 80
      })
      setTrendsRankings(res.data?.rankings ?? [])
      setTrendsMeta(res.meta ?? null)
      if (!evolHashtagId) {
        setEvolSeries([])
      }
    } catch {
      setTrendsRankings([])
    } finally {
      setTrendsRankingsLoading(false)
    }
  }

  const fetchEvolution = async () => {
    if (!canRead) return
    const id = Number.parseInt(evolHashtagId, 10)
    if (Number.isNaN(id)) {
      toast.error('Choisissez un hashtag pour le graphique')
      return
    }
    setEvolChartLoading(true)
    try {
      const res = await hashtagService.trends({
        region: trendsRegion || undefined,
        date_from: trendsFrom || undefined,
        date_to: trendsTo || undefined,
        hashtag_id: id
      })
      setEvolSeries(res.data?.series ?? [])
      setTrendsMeta(res.meta ?? null)
    } catch {
      setEvolSeries([])
    } finally {
      setEvolChartLoading(false)
    }
  }

  useEffect(() => {
    if (tab === 1 && canRead) {
      void fetchTrendsRankings()
    }
  }, [tab, canRead])

  /** Chargement des hashtags pour les sélecteurs (Tendances + Associations) */
  useEffect(() => {
    if (!canRead || (tab !== 1 && tab !== 2)) return
    let cancelled = false
    hashtagService
      .list(1, 200, {})
      .then(res => {
        if (!cancelled) setHashtagPickerOptions(res.data ?? [])
      })
      .catch(() => {
        if (!cancelled) setHashtagPickerOptions([])
      })
    return () => {
      cancelled = true
    }
  }, [canRead, tab])

  const loadAssociations = useCallback(
    async (
      which: 'both' | 'videos' | 'comments',
      vPageArg = vidPage,
      cPageArg = cmtPage,
      vPerPageArg = vidPerPage,
      cPerPageArg = cmtPerPage
    ) => {
      if (!canRead) return
      const id = Number.parseInt(assocHashtagId, 10)
      if (Number.isNaN(id)) {
        toast.error('Indiquez un identifiant hashtag valide')
        return
      }
      setAssocLoading(true)
      try {
        if (which === 'both' || which === 'videos') {
          const v = await hashtagService.videoAssociations(id, vPageArg + 1, vPerPageArg)
          setVidLinks(v.data ?? [])
          setVidTotal(v.pagination?.total ?? 0)
        }
        if (which === 'both' || which === 'comments') {
          const c = await hashtagService.commentAssociations(id, cPageArg + 1, cPerPageArg)
          setCmtLinks(c.data ?? [])
          setCmtTotal(c.pagination?.total ?? 0)
        }
      } catch {
        toast.error('Chargement des associations impossible')
      } finally {
        setAssocLoading(false)
      }
    },
    [assocHashtagId, canRead, vidPage, cmtPage, vidPerPage, cmtPerPage]
  )

  useEffect(() => {
    if (tab === 2 && assocHashtagId && canRead) {
      void loadAssociations('both', 0, 0)
    }
  }, [tab, assocHashtagId, canRead])

  useEffect(() => {
    // Reset pages lorsqu'on change l'id, pour que la première page soit cohérente.
    // Si on est déjà sur l'onglet "Associations", on évite de vider immédiatement
    // les résultats pour ne pas annuler le chargement automatique.
    setVidPage(0)
    setCmtPage(0)
    if (tab !== 2) {
      setVidLinks([])
      setCmtLinks([])
      setVidTotal(0)
      setCmtTotal(0)
    }
  }, [assocHashtagId, tab])

  const chartOptions: ApexOptions = useMemo(
    () => ({
      chart: { toolbar: { show: false }, animations: { enabled: true } },
      stroke: { width: 2, curve: 'smooth' },
      xaxis: {
        categories: evolSeries.map(r => r.date?.slice(5) ?? ''),
        labels: { rotate: -45 }
      },
      colors: [theme.palette.primary.main, theme.palette.warning.main],
      legend: { position: 'top' },
      dataLabels: { enabled: false },
      yaxis: { labels: { formatter: v => `${Math.round(Number(v))}` } }
    }),
    [evolSeries, theme.palette.primary.main, theme.palette.warning.main]
  )

  const chartSeries = useMemo(
    () => [
      { name: 'Usage', data: evolSeries.map(r => Number(r.usage_count ?? 0)) },
      { name: 'Vues', data: evolSeries.map(r => Number(r.views_count ?? 0)) }
    ],
    [evolSeries]
  )

  const toggleSelect = (id: number) => {
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (selected.length === items.length) {
      setSelected([])
    } else {
      setSelected(items.map(i => i.id))
    }
  }

  const submitCreate = async () => {
    if (!createLabel.trim()) return
    try {
      await hashtagService.create(createLabel.trim())
      toast.success('Hashtag créé')
      setCreateOpen(false)
      setCreateLabel('')
      fetchList()
    } catch {
      toast.error('Création impossible')
    }
  }

  const submitMerge = async () => {
    if (mergeKeepId === '' || selected.length < 2) return
    const keep = Number(mergeKeepId)
    const from = selected.filter(id => id !== keep)
    if (!selected.includes(keep)) {
      toast.error('Le hashtag conservé doit faire partie de la sélection')
      return
    }
    if (from.length === 0) {
      toast.error('Sélectionnez au moins un autre hashtag à fusionner')
      return
    }
    try {
      await hashtagService.merge(keep, from)
      toast.success('Fusion effectuée')
      setMergeOpen(false)
      setSelected([])
      setMergeKeepId('')
      fetchList()
    } catch {
      toast.error('Fusion impossible')
    }
  }

  const submitEdit = async () => {
    if (!editTargetId) return
    const next = editValue.trim()
    if (!next) return
    try {
      await hashtagService.update(editTargetId, { label: next })
      toast.success('Hashtag mis à jour')
      setEditOpen(false)
      setEditTargetId(null)
      setEditValue('')
      fetchList()
    } catch {
      toast.error('Mise à jour impossible')
    }
  }

  const submitDelete = async () => {
    if (!deleteTargetId) return
    try {
      await hashtagService.remove(deleteTargetId)
      toast.success('Hashtag supprimé')
      setDeleteOpen(false)
      setDeleteTargetId(null)
      fetchList()
    } catch {
      toast.error('Suppression impossible')
    }
  }

  const toggleBlocked = async (row: HashtagRecord) => {
    if (row.is_blocked === undefined) {
      toast.error('Blocage non disponible sur ce schéma')
      return
    }
    try {
      await hashtagService.update(row.id, { is_blocked: !row.is_blocked, block_reason: !row.is_blocked ? 'Bloqué via back-office' : null })
      toast.success(row.is_blocked ? 'Débloqué' : 'Bloqué')
      fetchList()
    } catch {
      toast.error('Action impossible')
    }
  }

  const resetListFilters = () => {
    setSearch('')
    setPage(0)
  }

  const resetTrendsFilters = () => {
    setTrendsRegion('')
    setTrendsFrom('')
    setTrendsTo('')
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs items={[{ label: 'Hashtags' }]} />
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title='Hashtags' subheader='CRUD, tendances, associations vidéo et commentaire' />
            {!canRead ? (
              <Box className='p-6'>
                <Typography color='text.secondary'>Permission hashtags.read requise.</Typography>
              </Box>
            ) : (
              <>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 4, borderBottom: 1, borderColor: 'divider' }}>
                  <Tab label='Liste' />
                  <Tab label='Tendances' />
                  <Tab label='Associations' />
                </Tabs>
                <CardContent sx={{ px: 0 }}>
                  {tab === 0 && (
                    <Box sx={{ px: 4, pb: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end', mb: 4, py: 2 }}>
                        <CustomTextField
                          size='small'
                          placeholder='Rechercher...'
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                          sx={{ minWidth: 240 }}
                        />
                        <Button
                          variant='outlined'
                          color='secondary'
                          size='small'
                          onClick={resetListFilters}
                          sx={{ minHeight: 40, textTransform: 'none' }}
                        >
                          Réinitialiser
                        </Button>
                        {canWrite && (
                          <>
                            <Button variant='contained' onClick={() => setCreateOpen(true)}>
                              Nouveau
                            </Button>
                            <Button
                              variant='outlined'
                              disabled={selected.length < 2}
                              onClick={() => {
                                setMergeKeepId(selected[0] ?? '')
                                setMergeOpen(true)
                              }}
                            >
                              Fusionner
                            </Button>
                          </>
                        )}
                      </Box>
                      {loading ? (
                        <Box className='flex justify-center p-10'>
                          <CircularProgress />
                        </Box>
                      ) : (
                        <div className='overflow-x-auto'>
                          <table className={tableStyles.table}>
                            <thead>
                              <tr>
                                {canWrite && (
                                  <th>
                                    <Checkbox
                                      size='small'
                                      checked={items.length > 0 && selected.length === items.length}
                                      indeterminate={selected.length > 0 && selected.length < items.length}
                                      onChange={toggleSelectAll}
                                    />
                                  </th>
                                )}
                                <th>ID</th>
                                <th>Libellé</th>
                                <th>Usage</th>
                                <th>Vidéos / vues</th>
                                <th>Statut</th>
                                {canWrite && <th align='right'>Actions</th>}
                              </tr>
                            </thead>
                            <tbody>
                              {items.map(row => (
                                <tr key={row.id}>
                                  {canWrite && (
                                    <td>
                                      <Checkbox size='small' checked={selected.includes(row.id)} onChange={() => toggleSelect(row.id)} />
                                    </td>
                                  )}
                                  <td>{row.id}</td>
                                  <td>{displayHashtagLabel(row)}</td>
                                  <td>{row.usage_count ?? '—'}</td>
                                  <td>
                                    {[row.videos_count, row.views_count].filter(v => v != null).join(' / ') || '—'}
                                  </td>
                                  <td>
                                    {row.is_blocked ? (
                                      <StatusBadge label='Bloqué' tone='error' />
                                    ) : (
                                      <StatusBadge label='OK' tone='neutral' />
                                    )}
                                  </td>
                                  {canWrite && (
                                    <td align='right'>
                                      <OptionMenu
                                        options={[
                                          {
                                            text: 'Modifier libellé',
                                            icon: <i className='tabler-edit' />,
                                            menuItemProps: {
                                              onClick: () => {
                                                setEditTargetId(row.id)
                                                setEditValue(displayHashtagLabel(row))
                                                setEditOpen(true)
                                              }
                                            }
                                          },
                                          ...(row.is_blocked !== undefined
                                            ? [
                                                {
                                                  text: row.is_blocked ? 'Débloquer' : 'Bloquer',
                                                  icon: <i className={row.is_blocked ? 'tabler-lock-open' : 'tabler-lock'} />,
                                                  menuItemProps: { onClick: () => toggleBlocked(row) }
                                                }
                                              ]
                                            : []),
                                          {
                                            text: 'Supprimer',
                                            icon: <i className='tabler-trash' />,
                                            menuItemProps: {
                                              onClick: () => {
                                                setDeleteTargetId(row.id)
                                                setDeleteOpen(true)
                                              },
                                              sx: { color: 'error.main' }
                                            }
                                          }
                                        ]}
                                        iconButtonProps={{ size: 'small' }}
                                      />
                                    </td>
                                  )}
                                </tr>
                              ))}
                              {items.length === 0 && (
                                <tr>
                                  <td colSpan={canWrite ? 7 : 6} className='text-center text-secondary'>
                                    Aucun hashtag
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                      <TablePagination
                        component='div'
                        count={total}
                        page={page}
                        onPageChange={(_, p) => setPage(p)}
                        rowsPerPage={perPage}
                        onRowsPerPageChange={e => {
                          setPerPage(Number.parseInt(e.target.value, 10))
                          setPage(0)
                        }}
                        rowsPerPageOptions={[10, 15, 25, 50]}
                        labelRowsPerPage='Lignes'
                      />
                    </Box>
                  )}

                  {tab === 1 && (
                    <Box sx={{ px: 4, pb: 2 }}>
                      {trendsMeta?.table_missing && (
                        <Typography color='text.secondary' sx={{ mb: 2 }}>
                          Table hashtag_trends absente : classements et courbes vides tant que les migrations ne sont pas appliquées.
                        </Typography>
                      )}

                      <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1.5 }}>
                        Classement
                      </Typography>
                      <Grid container spacing={2} alignItems='flex-end' sx={{ mb: 2 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <CustomTextField
                            fullWidth
                            size='small'
                            label='Région (optionnel)'
                            value={trendsRegion}
                            onChange={e => setTrendsRegion(e.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <DateFilterField fullWidth label='Depuis' value={trendsFrom} onChange={setTrendsFrom} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <DateFilterField fullWidth label='Jusqu’à' value={trendsTo} onChange={setTrendsTo} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                          <Button
                            fullWidth
                            variant='contained'
                            onClick={() => void fetchTrendsRankings()}
                            disabled={trendsRankingsLoading}
                            sx={{ height: 40, minHeight: 40 }}
                          >
                            Actualiser le classement
                          </Button>
                        </Grid>
                      </Grid>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Button
                          variant='outlined'
                          color='secondary'
                          size='small'
                          onClick={resetTrendsFilters}
                          sx={{ minHeight: 40, textTransform: 'none' }}
                        >
                          Réinitialiser
                        </Button>
                      </Box>

                      <Box sx={{ position: 'relative', mb: 4, minHeight: trendsRankingsLoading ? 220 : 'auto' }}>
                        {trendsRankingsLoading && (
                          <Box
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              zIndex: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 1,
                              bgcolor: theme => alpha(theme.palette.background.paper, 0.72),
                              backdropFilter: 'blur(1px)'
                            }}
                          >
                            <CircularProgress />
                          </Box>
                        )}
                        <div className='overflow-x-auto'>
                          <table className={tableStyles.table}>
                            <thead>
                              <tr>
                                <th>Hashtag</th>
                                <th>Région</th>
                                <th>Usage (période)</th>
                                <th>Vues</th>
                                <th>Dernière date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {trendsRankings.map((r, i) => (
                                <tr
                                  key={`${r.hashtag_id}-${r.region}-${i}`}
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => setEvolHashtagId(String(r.hashtag_id))}
                                >
                                  <td>
                                    <Typography component='span' fontWeight={600}>{r.hashtag_label}</Typography>{' '}
                                    <Typography variant='caption' color='text.secondary'>(#{r.hashtag_id})</Typography>
                                  </td>
                                  <td>{r.region ?? '—'}</td>
                                  <td>{r.usage_sum}</td>
                                  <td>{r.views_sum}</td>
                                  <td>{r.last_date ?? '—'}</td>
                                </tr>
                              ))}
                              {trendsRankings.length === 0 && !trendsRankingsLoading && (
                                <tr>
                                  <td colSpan={5} className='text-center text-secondary'>
                                    Aucune donnée de tendance
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
                          Astuce : cliquez une ligne pour préremplir le graphique ci-dessous.
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 3 }} />

                      <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1.5 }}>
                        Évolution (graphique)
                      </Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'flex-end' }} sx={{ mb: 2 }}>
                        <Autocomplete
                          size='small'
                          sx={{ flex: 1, minWidth: 260 }}
                          options={hashtagPickerOptions}
                          getOptionLabel={o => `${displayHashtagLabel(o)} (#${o.id})`}
                          isOptionEqualToValue={(a, b) => a.id === b.id}
                          value={hashtagPickerOptions.find(o => o.id === Number.parseInt(evolHashtagId, 10)) ?? null}
                          onChange={(_, v) => setEvolHashtagId(v ? String(v.id) : '')}
                          renderInput={params => (
                            <TextField {...params} label='Hashtag' placeholder='Rechercher par nom…' />
                          )}
                        />
                        <Button
                          variant='outlined'
                          onClick={() => void fetchEvolution()}
                          disabled={evolChartLoading || !evolHashtagId}
                          sx={{ height: 40, minHeight: 40, flexShrink: 0 }}
                        >
                          {evolChartLoading ? 'Chargement…' : 'Charger le graphique'}
                        </Button>
                      </Stack>
                      {evolChartLoading && (
                        <Box display='flex' justifyContent='center' alignItems='center' minHeight={140} sx={{ mb: 2 }}>
                          <CircularProgress size={36} />
                        </Box>
                      )}
                      {!evolChartLoading && evolSeries.length > 0 ? (
                        <AppReactApexCharts type='line' height={320} series={chartSeries} options={chartOptions} />
                      ) : !evolChartLoading ? (
                        <Typography variant='body2' color='text.secondary'>
                          Aucune série chargée. Choisissez un hashtag puis chargez le graphique, ou cliquez une ligne du classement.
                        </Typography>
                      ) : null}
                    </Box>
                  )}

                  {tab === 2 && (
                    <Box sx={{ px: 4, pb: 2 }}>
                      <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1.5 }}>
                        Associations hashtag → vidéos & commentaires
                      </Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'flex-end' }} sx={{ mb: 3 }}>
                        <Autocomplete
                          size='small'
                          sx={{ flex: 1, minWidth: 280 }}
                          options={hashtagPickerOptions}
                          getOptionLabel={o => `${displayHashtagLabel(o)} (#${o.id})`}
                          isOptionEqualToValue={(a, b) => a.id === b.id}
                          value={hashtagPickerOptions.find(o => o.id === Number.parseInt(assocHashtagId, 10)) ?? null}
                          onChange={(_, v) => setAssocHashtagId(v ? String(v.id) : '')}
                          renderInput={params => (
                            <TextField {...params} label='Hashtag' placeholder='Rechercher par nom ou #…' />
                          )}
                        />
                        <Button
                          variant='contained'
                          onClick={() => {
                            setVidPage(0)
                            setCmtPage(0)
                            void loadAssociations('both', 0, 0, vidPerPage, cmtPerPage)
                          }}
                          disabled={assocLoading || !assocHashtagId}
                          sx={{ height: 40, minHeight: 40, flexShrink: 0 }}
                        >
                          {assocLoading ? 'Chargement…' : 'Charger les associations'}
                        </Button>
                      </Stack>

                      {assocHashtagId && !assocLoading && (
                        <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap sx={{ mb: 2 }}>
                          <StatusBadge tone='primary' label={`${vidTotal} association(s) vidéo`} />
                          <StatusBadge tone='secondary' label={`${cmtTotal} association(s) commentaire`} />
                        </Stack>
                      )}

                      <Box sx={{ position: 'relative', minHeight: assocLoading ? 200 : 'auto' }}>
                        {assocLoading && (
                          <Box
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              zIndex: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 1,
                              bgcolor: t => alpha(t.palette.background.paper, 0.75),
                              backdropFilter: 'blur(2px)'
                            }}
                          >
                            <CircularProgress />
                          </Box>
                        )}

                      <Typography variant='subtitle2' sx={{ mb: 1, opacity: assocLoading ? 0.5 : 1 }}>
                        Vidéos liées
                      </Typography>
                      <div className='overflow-x-auto mb-6' style={{ opacity: assocLoading ? 0.45 : 1 }}>
                        <table className={tableStyles.table}>
                          <thead>
                            <tr>
                              <th>Video</th>
                              <th>Titre</th>
                              <th>Vues via hashtag</th>
                              <th>Engagement</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vidLinks.map(v => (
                              <tr key={v.link_id}>
                                <td>{v.video_id}</td>
                                <td>{v.video_title ?? '—'}</td>
                                <td>{v.views_from_hashtag ?? '—'}</td>
                                <td>{v.engagement_rate ?? '—'}</td>
                              </tr>
                            ))}
                            {vidLinks.length === 0 && (
                              <tr>
                                <td colSpan={4} className='text-center text-secondary'>
                                  Aucune association vidéo chargée
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <TablePagination
                        component='div'
                        count={vidTotal}
                        page={vidPage}
                        onPageChange={(_, p) => {
                          setVidPage(p)
                          void loadAssociations('videos', p, cmtPage, vidPerPage, cmtPerPage)
                        }}
                        rowsPerPage={vidPerPage}
                        onRowsPerPageChange={e => {
                          const next = Number.parseInt(e.target.value, 10)
                          setVidPerPage(next)
                          setVidPage(0)
                          void loadAssociations('videos', 0, cmtPage, next, cmtPerPage)
                        }}
                        rowsPerPageOptions={[10, 15, 25, 50]}
                        labelRowsPerPage='Vidéos'
                      />
                      <Typography variant='subtitle2' sx={{ mb: 1, mt: 4, opacity: assocLoading ? 0.5 : 1 }}>
                        Commentaires liés
                      </Typography>
                      <div className='overflow-x-auto' style={{ opacity: assocLoading ? 0.45 : 1 }}>
                        <table className={tableStyles.table}>
                          <thead>
                            <tr>
                              <th>Commentaire</th>
                              <th>Aperçu</th>
                              <th>Vidéo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cmtLinks.map(c => (
                              <tr key={c.link_id}>
                                <td>{c.comment_id}</td>
                                <td style={{ maxWidth: 360 }}>{c.excerpt ?? '—'}</td>
                                <td>
                                  {c.video_id} {c.video_title ? `— ${c.video_title}` : ''}
                                </td>
                              </tr>
                            ))}
                            {cmtLinks.length === 0 && (
                              <tr>
                                <td colSpan={3} className='text-center text-secondary'>
                                  Aucune association commentaire chargée
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <TablePagination
                        component='div'
                        count={cmtTotal}
                        page={cmtPage}
                        onPageChange={(_, p) => {
                          setCmtPage(p)
                          void loadAssociations('comments', vidPage, p, vidPerPage, cmtPerPage)
                        }}
                        rowsPerPage={cmtPerPage}
                        onRowsPerPageChange={e => {
                          const next = Number.parseInt(e.target.value, 10)
                          setCmtPerPage(next)
                          setCmtPage(0)
                          void loadAssociations('comments', vidPage, 0, vidPerPage, next)
                        }}
                        rowsPerPageOptions={[10, 15, 25, 50]}
                        labelRowsPerPage='Commentaires'
                      />
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </>
            )}
          </Card>
        </Grid>
      </Grid>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Modifier libellé</DialogTitle>
        <DialogContent sx={{ minWidth: 320 }}>
          <CustomTextField
            autoFocus
            fullWidth
            label='Libellé'
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            sx={{ mt: 1 }}
          />
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
            Astuce: vous pouvez saisir sans « # ».
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setEditOpen(false)
              setEditTargetId(null)
              setEditValue('')
            }}
          >
            Annuler
          </Button>
          <Button variant='contained' onClick={submitEdit} disabled={!editValue.trim()}>
            Mettre à jour
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Supprimer le hashtag</DialogTitle>
        <DialogContent sx={{ minWidth: 320 }}>
          <Typography variant='body2'>
            La suppression retire aussi les liaisons pivot en base (hashtag_videos, comment_hashtag).
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteOpen(false)
              setDeleteTargetId(null)
            }}
          >
            Annuler
          </Button>
          <Button variant='contained' color='error' onClick={submitDelete}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
        <DialogTitle>Nouveau hashtag</DialogTitle>
        <DialogContent sx={{ minWidth: 320 }}>
          <CustomTextField autoFocus fullWidth label='Libellé' value={createLabel} onChange={e => setCreateLabel(e.target.value)} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button variant='contained' onClick={submitCreate}>
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={mergeOpen} onClose={() => setMergeOpen(false)}>
        <DialogTitle>Fusionner des hashtags</DialogTitle>
        <DialogContent sx={{ minWidth: 340 }}>
          <Typography variant='body2' sx={{ mb: 2 }}>
            Les sources sont retirées après fusion ; les liaisons sont regroupées sur le hashtag conservé.
          </Typography>
          <FormControl fullWidth size='small' sx={{ mt: 1 }}>
            <InputLabel>Hashtag à conserver</InputLabel>
            <Select
              value={mergeKeepId === '' ? '' : String(mergeKeepId)}
              label='Hashtag à conserver'
              onChange={e => setMergeKeepId(e.target.value === '' ? '' : Number(e.target.value))}
            >
              {selected.map(id => {
                const row = items.find(i => i.id === id)
                return (
                  <MenuItem key={id} value={String(id)}>
                    {row ? displayHashtagLabel(row) : id} ({id})
                  </MenuItem>
                )
              })}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMergeOpen(false)}>Annuler</Button>
          <Button variant='contained' onClick={submitMerge}>
            Fusionner
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
