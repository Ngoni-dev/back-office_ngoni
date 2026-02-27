'use client'

import { toast } from 'react-toastify'
// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import TablePagination from '@mui/material/TablePagination'
import CircularProgress from '@mui/material/CircularProgress'

// Style Imports (comme Music)
import tableStyles from '@core/styles/table.module.css'

// Service Imports
import { artistService } from '@/services/artist.service'

// Type Imports
import type { Artist } from '@/types/artist.types'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Component Imports
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import { useDebounceValue } from '@/hooks/useDebounceValue'

export default function ArtistList() {
  const router = useRouter()
  const { lang } = useParams()
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)
  const [searchName, setSearchName] = useState('')
  const debouncedSearchName = useDebounceValue(searchName, 400)

  const fetchArtists = async () => {
    setLoading(true)
    try {
      if (debouncedSearchName.trim()) {
        const response = await artistService.list(1, 500)
        const all = response.data ?? []
        const filtered = all.filter(a =>
          a.name.toLowerCase().includes(debouncedSearchName.trim().toLowerCase())
        )
        setArtists(filtered)
        setTotal(filtered.length)
      } else {
        const response = await artistService.list(page + 1, perPage)
        setArtists(response.data ?? [])
        const meta = response.pagination ?? (response as { meta?: { total: number } }).meta
        setTotal(meta?.total ?? response.data?.length ?? 0)
      }
    } catch {
      setArtists([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(0)
  }, [debouncedSearchName])

  useEffect(() => {
    fetchArtists()
  }, [page, perPage, debouncedSearchName])

  const handlePageChange = (_: unknown, newPage: number) => setPage(newPage)
  const handlePerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPerPage(parseInt(e.target.value, 10))
    setPage(0)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet artiste ?')) return
    try {
      await artistService.delete(id)
      toast.success('Artiste supprimé')
      fetchArtists()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleVerify = async (id: number) => {
    try {
      await artistService.verify(id)
      toast.success('Artiste vérifié')
      fetchArtists()
    } catch {
      toast.error('Erreur lors de la vérification')
    }
  }

  const handleUnverify = async (id: number) => {
    try {
      await artistService.unverify(id)
      toast.success('Vérification retirée')
      fetchArtists()
    } catch {
      toast.error('Erreur lors de la révocation')
    }
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs items={[{ label: 'Artistes' }]} />
      <Grid container spacing={6} sx={{ width: '100%' }}>
        <Grid size={{ xs: 12 }} sx={{ minWidth: 0, width: '100%', maxWidth: '100%' }}>
          <Card sx={{ width: '100%', maxWidth: '100%' }}>
            <CardHeader
              title='Artistes'
              action={
                <Button
                  variant='contained'
                  startIcon={<i className='tabler-plus' />}
                  onClick={() => router.push(getLocalizedUrl('/apps/ngoni/artists/new', lang as string))}
                >
                  Ajouter
                </Button>
              }
            />
            <div className='flex flex-wrap items-end justify-between gap-4 p-6 border-bs'>
              <div className='flex flex-wrap items-end gap-4'>
                <CustomTextField
                  size='small'
                  placeholder='Rechercher par nom'
                  value={searchName}
                  onChange={e => setSearchName(e.target.value)}
                  sx={{ minWidth: 220 }}
                />
              </div>
            </div>
            {loading ? (
              <Box display='flex' justifyContent='center' alignItems='center' minHeight={280}>
                <CircularProgress />
              </Box>
            ) : artists.length === 0 ? (
              <Box
                display='flex'
                flexDirection='column'
                alignItems='center'
                justifyContent='center'
                minHeight={200}
                gap={2}
                className='p-6'
              >
                <i className='tabler-user-off text-5xl text-textDisabled' />
                <Typography variant='body1' color='text.secondary'>
                  Aucun artiste trouvé
                </Typography>
                <Button
                  variant='tonal'
                  startIcon={<i className='tabler-plus' />}
                  onClick={() => router.push(getLocalizedUrl('/apps/ngoni/artists/new', lang as string))}
                >
                  Ajouter un artiste
                </Button>
              </Box>
            ) : (
              <>
                <div className='overflow-x-auto' style={{ width: '100%' }}>
                  <table className={tableStyles.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Nom</th>
                        <th>Biographie</th>
                        <th align='right'>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(debouncedSearchName.trim()
                        ? artists.slice(page * perPage, page * perPage + perPage)
                        : artists
                      ).map(a => (
                        <tr key={a.id}>
                          <td>{a.id}</td>
                          <td>
                            <Badge
                              overlap='circular'
                              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                              badgeContent={
                                <Box
                                  component='span'
                                  title={a.verified ? 'Vérifié' : 'Non vérifié'}
                                  sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 16,
                                    height: 16,
                                    borderRadius: '50%',
                                    bgcolor: a.verified ? '#1DA1F2' : 'action.disabledBackground',
                                    color: a.verified ? 'white' : 'text.disabled',
                                    border: '2px solid',
                                    borderColor: 'background.paper',
                                    flexShrink: 0
                                  }}
                                >
                                  {a.verified ? (
                                    <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round'>
                                      <polyline points='20 6 9 17 4 12' />
                                    </svg>
                                  ) : (
                                    <i className='tabler-minus' style={{ fontSize: 10 }} />
                                  )}
                                </Box>
                              }
                            >
                              <Avatar src={a.profile_image_url || undefined} alt={a.name} sx={{ width: 36, height: 36 }}>
                                {a.name.charAt(0).toUpperCase()}
                              </Avatar>
                            </Badge>
                          </td>
                          <td>
                            <Button
                              variant='text'
                              color='primary'
                              size='small'
                              sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
                              onClick={() =>
                                router.push(getLocalizedUrl(`/apps/ngoni/artists/${a.id}`, lang as string))
                              }
                            >
                              {a.name}
                            </Button>
                          </td>
                          <td>
                            {a.bio ? (a.bio.length > 50 ? `${a.bio.substring(0, 50)}...` : a.bio) : '—'}
                          </td>
                          <td align='right'>
                            <OptionMenu
                              options={[
                                {
                                  text: 'Détails',
                                  icon: <i className='tabler-eye' />,
                                  menuItemProps: {
                                    onClick: () =>
                                      router.push(getLocalizedUrl(`/apps/ngoni/artists/${a.id}`, lang as string))
                                  }
                                },
                                {
                                  text: 'Modifier',
                                  icon: <i className='tabler-edit' />,
                                  menuItemProps: {
                                    onClick: () =>
                                      router.push(getLocalizedUrl(`/apps/ngoni/artists/${a.id}`, lang as string))
                                  }
                                },
                                { divider: true },
                                ...(a.verified
                                  ? [
                                      {
                                        text: 'Dévérifier',
                                        icon: <i className='tabler-circle-x' />,
                                        menuItemProps: { onClick: () => handleUnverify(a.id) }
                                      }
                                    ]
                                  : [
                                      {
                                        text: 'Vérifier',
                                        icon: <i className='tabler-check' />,
                                        menuItemProps: { onClick: () => handleVerify(a.id) }
                                      }
                                    ]),
                                { divider: true },
                                {
                                  text: 'Supprimer',
                                  icon: <i className='tabler-trash' />,
                                  menuItemProps: {
                                    onClick: () => handleDelete(a.id),
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
                  onPageChange={handlePageChange}
                  rowsPerPage={perPage}
                  onRowsPerPageChange={handlePerPageChange}
                  rowsPerPageOptions={[10, 15, 25, 50]}
                  labelRowsPerPage='Lignes par page'
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
                />
              </>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
