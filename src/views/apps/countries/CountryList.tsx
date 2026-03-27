'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import TablePagination from '@mui/material/TablePagination'
import CircularProgress from '@mui/material/CircularProgress'

import tableStyles from '@core/styles/table.module.css'

import { countryService, type Country } from '@/services/country.service'
import { getLocalizedUrl } from '@/utils/i18n'
import DeleteConfirmDialog from '@/components/dialogs/DeleteConfirmDialog'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import { useDebounceValue } from '@/hooks/useDebounceValue'
import { toast } from 'react-toastify'
import { flagCdnUrl } from '@/utils/countryFlagEmoji'

export default function CountryList() {
  const router = useRouter()
  const { lang } = useParams()
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounceValue(search, 400)
  const [deleteDialog, setDeleteDialog] = useState<{ id: number } | null>(null)

  const fetchCountries = async () => {
    setLoading(true)
    try {
      const res = await countryService.listPaginated(page + 1, perPage, {
        search: debouncedSearch || undefined
      })
      setCountries(res.data ?? [])
      setTotal(res.pagination?.total ?? 0)
    } catch {
      setCountries([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  useEffect(() => {
    fetchCountries()
  }, [page, perPage, debouncedSearch])

  const handlePageChange = (_: unknown, newPage: number) => setPage(newPage)
  const handlePerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPerPage(parseInt(e.target.value, 10))
    setPage(0)
  }

  const handleDelete = async (id: number) => {
    try {
      await countryService.delete(id)
      toast.success('Pays supprimé')
      setDeleteDialog(null)
      fetchCountries()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const resetFilters = () => {
    setSearch('')
    setPage(0)
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs items={[{ label: 'Pays' }]} />
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title='Pays'
              subheader='Gestion des pays'
              action={
                <Button
                  variant='contained'
                  startIcon={<i className='tabler-plus' />}
                  onClick={() => router.push(getLocalizedUrl('/apps/countries/new', lang as string))}
                >
                  Ajouter
                </Button>
              }
            />
            <Box sx={{ px: 4, pb: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <CustomTextField
                placeholder='Rechercher par nom ou code...'
                value={search}
                onChange={e => setSearch(e.target.value)}
                size='small'
                sx={{ minWidth: 280 }}
              />
              <Button variant='outlined' color='secondary' size='small' onClick={resetFilters} sx={{ minHeight: 40, textTransform: 'none' }}>
                Réinitialiser
              </Button>
            </Box>
            {loading ? (
              <Box display='flex' justifyContent='center' alignItems='center' minHeight={200}>
                <CircularProgress />
              </Box>
            ) : countries.length === 0 ? (
              <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' minHeight={200} gap={2} className='p-6'>
                <i className='tabler-world-off text-5xl text-textDisabled' />
                <Typography variant='body1' color='text.secondary'>Aucun pays</Typography>
              </Box>
            ) : (
              <>
                <div className='overflow-x-auto'>
                  <table className={tableStyles.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Code</th>
                        <th align='right'>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {countries.map(c => {
                        const flagSrc = flagCdnUrl(c.code)
                        return (
                        <tr key={c.id}>
                          <td>{c.id}</td>
                          <td>
                            <Box display='flex' alignItems='center' gap={1.5}>
                              {flagSrc ? (
                                <Box
                                  component='img'
                                  src={flagSrc}
                                  alt=''
                                  loading='lazy'
                                  decoding='async'
                                  referrerPolicy='no-referrer'
                                  title={c.code ?? undefined}
                                  sx={{
                                    width: 32,
                                    height: 24,
                                    objectFit: 'cover',
                                    borderRadius: 0.5,
                                    flexShrink: 0,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    display: 'block'
                                  }}
                                  onError={e => {
                                    ;(e.target as HTMLImageElement).style.display = 'none'
                                  }}
                                />
                              ) : null}
                              <Typography component='span' variant='body2'>
                                {c.name}
                              </Typography>
                            </Box>
                          </td>
                          <td>{c.code}</td>
                          <td align='right'>
                            <OptionMenu
                              options={[
                                {
                                  text: 'Modifier',
                                  icon: <i className='tabler-edit' />,
                                  menuItemProps: {
                                    onClick: () =>
                                      router.push(getLocalizedUrl(`/apps/countries/${c.id}/edit`, lang as string))
                                  }
                                },
                                { divider: true },
                                {
                                  text: 'Supprimer',
                                  icon: <i className='tabler-trash' />,
                                  menuItemProps: {
                                    onClick: () => setDeleteDialog({ id: c.id }),
                                    className: 'text-error'
                                  }
                                }
                              ]}
                              iconButtonProps={{ size: 'small' }}
                            />
                          </td>
                        </tr>
                        )
                      })}
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
                />
              </>
            )}
          </Card>
        </Grid>
      </Grid>
      <DeleteConfirmDialog
        open={!!deleteDialog}
        onClose={() => setDeleteDialog(null)}
        onConfirm={async () => {
          if (deleteDialog) await handleDelete(deleteDialog.id)
        }}
        message='Supprimer ce pays ?'
      />
    </Box>
  )
}
