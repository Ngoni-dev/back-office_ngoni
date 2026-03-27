'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import { videoService, type Video } from '@/services/video.service'
import { toast } from 'react-toastify'
import { getLocalizedUrl } from '@/utils/i18n'

export default function VideoModerationQueue() {
  const { lang } = useParams()
  const router = useRouter()
  const [items, setItems] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await videoService.moderationQueue(page + 1, perPage, { search: search || undefined })
      setItems(res.data ?? [])
      setTotal(res.pagination?.total ?? 0)
    } catch {
      setItems([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, perPage, search])

  const moderate = async (id: number, moderation_status: 'approved' | 'rejected') => {
    try {
      await videoService.moderate(id, { moderation_status })
      toast.success('Modération mise à jour')
      fetchData()
    } catch {
      toast.error('Échec de la modération')
    }
  }

  const resetFilters = () => {
    setSearch('')
    setPage(0)
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs items={[{ label: 'Vidéos' }, { label: 'Modération' }]} />
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title='File de modération vidéo' subheader='Vidéos en attente de revue' />
            <Box sx={{ px: 4, pb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <CustomTextField
                size='small'
                placeholder='Rechercher titre/description...'
                value={search}
                onChange={e => setSearch(e.target.value)}
                sx={{ minWidth: 260 }}
              />
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
            ) : items.length === 0 ? (
              <Box className='p-6'>
                <Typography color='text.secondary'>Aucune vidéo en attente de modération.</Typography>
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
                          <td>{v.created_at ? new Date(v.created_at).toLocaleDateString('fr-FR') : '—'}</td>
                          <td align='right'>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                              <Button
                                size='small'
                                variant='tonal'
                                onClick={() => router.push(getLocalizedUrl(`/apps/videos/${v.id}`, lang as string))}
                              >
                                Détail
                              </Button>
                              <Button size='small' color='success' variant='contained' onClick={() => moderate(v.id, 'approved')}>Approuver</Button>
                              <Button size='small' color='error' variant='contained' onClick={() => moderate(v.id, 'rejected')}>Rejeter</Button>
                            </Box>
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
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
