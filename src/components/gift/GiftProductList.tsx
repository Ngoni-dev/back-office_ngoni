'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'

// Component Imports
import Pagination from '@/components/common/Pagination'
import CustomTextField from '@core/components/mui/TextField'
import GiftProductCard from './GiftProductCard'

// Hook Imports
import { useGift } from '@/hooks/useGift'

// Type Imports
import type { GiftProduct } from '@/types/gift.types'

interface GiftProductListProps {
  onEdit?: (product: GiftProduct) => void
  onDelete?: (product: GiftProduct) => void
  onToggleActive?: (product: GiftProduct) => void
  onView?: (product: GiftProduct) => void
  onCreate?: () => void
}

const GiftProductList = ({ onEdit, onDelete, onToggleActive, onView, onCreate }: GiftProductListProps) => {
  const { giftProducts, pagination, loading, error, fetchGiftProducts, toggleActive } = useGift()
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [filteredProducts, setFilteredProducts] = useState<GiftProduct[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)

  // Load products on mount
  useEffect(() => {
    fetchGiftProducts(1, 15)
  }, [])

  // Filter products based on search query and status
  useEffect(() => {
    let filtered = giftProducts

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((product: GiftProduct) => 
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((product: GiftProduct) => 
        statusFilter === 'active' ? product.is_active : !product.is_active
      )
    }

    setFilteredProducts(filtered)
  }, [searchQuery, statusFilter, giftProducts])

  const handlePageChange = async (page: number) => {
    setCurrentPage(page)
    await fetchGiftProducts(page, itemsPerPage)
  }

  const handlePerPageChange = async (perPage: number) => {
    setItemsPerPage(perPage)
    setCurrentPage(1)
    await fetchGiftProducts(1, perPage)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
  }

  const handleToggleActive = async (product: GiftProduct) => {
    try {
      await toggleActive(product.id)
      // Refresh the list
      await fetchGiftProducts(currentPage, itemsPerPage)
      onToggleActive?.(product)
    } catch (error) {
      console.error('Error toggling product status:', error)
    }
  }

  return (
    <Box>
      {/* Search and Filter Card */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          title='Rechercher des produits cadeaux'
          action={
            onCreate && (
              <Button
                variant='contained'
                startIcon={<i className='tabler-plus' />}
                onClick={onCreate}
              >
                Ajouter un produit
              </Button>
            )
          }
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 7 }}>
              <CustomTextField
                fullWidth
                label='Rechercher'
                placeholder='Rechercher par nom ou description'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={statusFilter}
                  label='Statut'
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                >
                  <MenuItem value='all'>Tous</MenuItem>
                  <MenuItem value='active'>Actifs</MenuItem>
                  <MenuItem value='inactive'>Inactifs</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 3, md: 3 }}>
              <Box display='flex' gap={2} height='100%' alignItems='center'>
                <Button
                  variant='tonal'
                  color='secondary'
                  onClick={handleClearFilters}
                  disabled={!searchQuery && statusFilter === 'all'}
                  startIcon={<i className='tabler-x' />}
                  fullWidth
                >
                  Réinitialiser
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity='error' sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box display='flex' justifyContent='center' alignItems='center' minHeight={200}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty State */}
      {!loading && filteredProducts.length === 0 && (
        <Card>
          <CardContent>
            <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' minHeight={200} gap={2}>
              <i className='tabler-gift-off' style={{ fontSize: 48, opacity: 0.5 }} />
              <Typography variant='h6' color='text.secondary'>
                Aucun produit cadeau trouvé
              </Typography>
              <Typography variant='body2' color='text.disabled'>
                {searchQuery || statusFilter !== 'all'
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Ajoutez un nouveau produit cadeau pour commencer'
                }
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Product Grid */}
      {!loading && filteredProducts.length > 0 && (
        <>
          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
                <GiftProductCard
                  product={product}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleActive={handleToggleActive}
                  onView={onView}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination && !searchQuery && statusFilter === 'all' && (
            <Box mt={4}>
              <Pagination
                page={pagination.current_page}
                perPage={pagination.per_page}
                meta={pagination}
                onPageChange={handlePageChange}
                onPerPageChange={handlePerPageChange}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  )
}

export default GiftProductList
