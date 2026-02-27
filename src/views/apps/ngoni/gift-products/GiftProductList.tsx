'use client'

import { toast } from 'react-toastify'
// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'

// Style Imports (comme Music / Artist / Genre)
import tableStyles from '@core/styles/table.module.css'

// Service Imports
import { giftProductService } from '@/services/gift.service'

// Type Imports
import type { GiftProduct } from '@/types/gift.types'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Component Imports
import DeleteConfirmDialog from '@/components/dialogs/DeleteConfirmDialog'
import NgoniBreadcrumbs from '@/components/NgoniBreadcrumbs'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import { useDebounceValue } from '@/hooks/useDebounceValue'

export default function GiftProductList() {
  const router = useRouter()
  const { lang } = useParams()
  const [products, setProducts] = useState<GiftProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(15)
  const [total, setTotal] = useState(0)
  const [searchName, setSearchName] = useState('')
  const debouncedSearchName = useDebounceValue(searchName, 400)
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined)
  const [deleteDialog, setDeleteDialog] = useState<number | null>(null)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      if (debouncedSearchName.trim()) {
        const response = await giftProductService.list(1, 500, filterActive !== undefined ? { is_active: filterActive } : undefined)
        const all = response.data ?? []
        const filtered = all.filter(
          p =>
            (p.name.toLowerCase().includes(debouncedSearchName.trim().toLowerCase()) ||
              p.description?.toLowerCase().includes(debouncedSearchName.trim().toLowerCase())) &&
            (filterActive === undefined || p.is_active === filterActive)
        )
        setProducts(filtered)
        setTotal(filtered.length)
      } else {
        const response = await giftProductService.list(page + 1, perPage, filterActive !== undefined ? { is_active: filterActive } : undefined)
        setProducts(response.data ?? [])
        const meta = response.meta
        setTotal(meta?.total ?? response.data?.length ?? 0)
      }
    } catch {
      setProducts([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(0)
  }, [debouncedSearchName, filterActive])

  useEffect(() => {
    fetchProducts()
  }, [page, perPage, debouncedSearchName, filterActive])

  const handlePageChange = (_: unknown, newPage: number) => setPage(newPage)
  const handlePerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPerPage(parseInt(e.target.value, 10))
    setPage(0)
  }

  const handleDelete = async (id: number) => {
    try {
      await giftProductService.delete(id)
      toast.success('Produit supprimé')
      setDeleteDialog(null)
      fetchProducts()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleToggleActive = async (id: number) => {
    try {
      await giftProductService.toggleActive(id)
      toast.success('Statut mis à jour')
      fetchProducts()
    } catch {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const displayedProducts = debouncedSearchName.trim()
    ? products.slice(page * perPage, page * perPage + perPage)
    : products

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <NgoniBreadcrumbs items={[{ label: 'Produits cadeaux' }]} />
      <Grid container spacing={6} sx={{ width: '100%' }}>
        <Grid size={{ xs: 12 }} sx={{ minWidth: 0, width: '100%', maxWidth: '100%' }}>
          <Card sx={{ width: '100%', maxWidth: '100%' }}>
            <CardHeader
              title='Produits cadeaux'
              action={
                <Button
                  variant='contained'
                  startIcon={<i className='tabler-plus' />}
                  onClick={() => router.push(getLocalizedUrl('/apps/ngoni/gift-products/new', lang as string))}
                >
                  Ajouter
                </Button>
              }
            />
            <div className='flex flex-wrap items-end justify-between gap-4 p-6 border-bs'>
              <div className='flex flex-wrap items-end gap-4'>
                <CustomTextField
                  size='small'
                  placeholder='Rechercher par nom ou description'
                  value={searchName}
                  onChange={e => setSearchName(e.target.value)}
                  sx={{ minWidth: 260 }}
                />
                <CustomTextField
                  select
                  size='small'
                  label='Statut'
                  value={filterActive === undefined ? '' : String(filterActive)}
                  onChange={e => {
                    const v = e.target.value
                    setFilterActive(v === '' ? undefined : v === 'true')
                  }}
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="true">Actifs</MenuItem>
                  <MenuItem value="false">Inactifs</MenuItem>
                </CustomTextField>
              </div>
            </div>
            {loading ? (
              <Box display='flex' justifyContent='center' alignItems='center' minHeight={280}>
                <CircularProgress />
              </Box>
            ) : products.length === 0 ? (
              <Box
                display='flex'
                flexDirection='column'
                alignItems='center'
                justifyContent='center'
                minHeight={200}
                gap={2}
                className='p-6'
              >
                <i className='tabler-gift-off text-5xl text-textDisabled' />
                <Typography variant='body1' color='text.secondary'>
                  Aucun produit cadeau trouvé
                </Typography>
                <Button
                  variant='tonal'
                  startIcon={<i className='tabler-plus' />}
                  onClick={() => router.push(getLocalizedUrl('/apps/ngoni/gift-products/new', lang as string))}
                >
                  Ajouter un produit
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
                        <th>Prix</th>
                        <th>Catégorie</th>
                        <th>Actif</th>
                        <th align='right'>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedProducts.map(p => (
                        <tr key={p.id}>
                          <td>{p.id}</td>
                          <td>
                            <Avatar
                              src={p.image_url || undefined}
                              alt={p.name}
                              variant='rounded'
                              sx={{ width: 36, height: 36 }}
                            >
                              {p.name.charAt(0).toUpperCase()}
                            </Avatar>
                          </td>
                          <td>
                            <Button
                              variant='text'
                              color='primary'
                              size='small'
                              sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
                              onClick={() =>
                                router.push(getLocalizedUrl(`/apps/ngoni/gift-products/${p.id}`, lang as string))
                              }
                            >
                              {p.name}
                            </Button>
                          </td>
                          <td>
                            {Number(p.price).toLocaleString('fr-FR')} {p.currency ?? 'XAF'}
                          </td>
                          <td>{p.category ?? '—'}</td>
                          <td>
                            <Chip
                              label={p.is_active ? 'Oui' : 'Non'}
                              variant='tonal'
                              color={p.is_active ? 'success' : 'default'}
                              size='small'
                            />
                          </td>
                          <td align='right'>
                            <OptionMenu
                              options={[
                                {
                                  text: 'Détails',
                                  icon: <i className='tabler-eye' />,
                                  menuItemProps: {
                                    onClick: () =>
                                      router.push(getLocalizedUrl(`/apps/ngoni/gift-products/${p.id}`, lang as string))
                                  }
                                },
                                {
                                  text: 'Modifier',
                                  icon: <i className='tabler-edit' />,
                                  menuItemProps: {
                                    onClick: () =>
                                      router.push(getLocalizedUrl(`/apps/ngoni/gift-products/${p.id}`, lang as string))
                                  }
                                },
                                { divider: true },
                                {
                                  text: p.is_active ? 'Désactiver' : 'Activer',
                                  icon: <i className='tabler-toggle-right' />,
                                  menuItemProps: { onClick: () => handleToggleActive(p.id) }
                                },
                                { divider: true },
                                {
                                  text: 'Supprimer',
                                  icon: <i className='tabler-trash' />,
                                  menuItemProps: {
                                    onClick: () => setDeleteDialog(p.id),
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
      <DeleteConfirmDialog
        open={deleteDialog !== null}
        onClose={() => setDeleteDialog(null)}
        onConfirm={async () => { if (deleteDialog !== null) await handleDelete(deleteDialog) }}
        message='Êtes-vous sûr de vouloir supprimer ce produit cadeau ?'
      />
    </Box>
  )
}
