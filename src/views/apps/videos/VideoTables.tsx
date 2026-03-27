'use client'

import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import TablePagination from '@mui/material/TablePagination'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import { videoService } from '@/services/video.service'
import tableStyles from '@core/styles/table.module.css'

type TabKey = 'ngoni_plus' | 'shares' | 'reposts' | 'favorites'

export default function VideoTables() {
  const [tab, setTab] = useState<TabKey>('ngoni_plus')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)
  const [tableMissing, setTableMissing] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setTableMissing(null)
    try {
      const res =
        tab === 'ngoni_plus'
          ? await videoService.ngoniPlus(page + 1, perPage)
          : tab === 'shares'
            ? await videoService.shares(page + 1, perPage)
            : tab === 'reposts'
              ? await videoService.reposts(page + 1, perPage)
              : await videoService.favoritesStats(page + 1, perPage)

      setItems(res.data ?? [])
      setTotal(res.pagination?.total ?? 0)
      const missing = (res.meta?.table_missing as string | undefined) ?? null
      setTableMissing(missing)
    } catch {
      setItems([])
      setTotal(0)
      setTableMissing(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [tab, page, perPage])

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs items={[{ label: 'Vidéos' }, { label: 'Tables' }]} />
      <Card>
        <CardHeader title='Tables vidéos avancées' subheader='BO-036 à BO-039' />
        <CardContent>
          <Tabs value={tab} onChange={(_, value) => { setTab(value); setPage(0) }}>
            <Tab value='ngoni_plus' label='Ngoni Plus' />
            <Tab value='shares' label='Partages' />
            <Tab value='reposts' label='Reposts' />
            <Tab value='favorites' label='Favoris' />
          </Tabs>

          {loading ? (
            <Box display='flex' justifyContent='center' py={6}><CircularProgress /></Box>
          ) : tableMissing ? (
            <Typography color='text.secondary' sx={{ mt: 3 }}>
              Table non disponible: {tableMissing}
            </Typography>
          ) : items.length === 0 ? (
            <Typography color='text.secondary' sx={{ mt: 3 }}>Aucune donnée.</Typography>
          ) : (
            <>
              <div className='overflow-x-auto' style={{ marginTop: 16 }}>
                <table className={tableStyles.table}>
                  <thead>
                    <tr>
                      {Object.keys(items[0]).map(key => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx}>
                        {Object.keys(items[0]).map(key => (
                          <td key={`${idx}-${key}`}>{String(item[key] ?? '—')}</td>
                        ))}
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
        </CardContent>
      </Card>
    </Box>
  )
}
