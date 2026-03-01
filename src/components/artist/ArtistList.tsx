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
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

// Component Imports
import Pagination from '@/components/common/Pagination'
import CustomTextField from '@core/components/mui/TextField'
import ArtistCard from './ArtistCard'

// Hook Imports
import { useArtist } from '@/hooks/useArtist'

// Type Imports
import type { Artist } from '@/types/artist.types'

interface ArtistListProps {
  onEdit?: (artist: Artist) => void
  onDelete?: (artist: Artist) => void
  onVerify?: (artist: Artist) => void
  onView?: (artist: Artist) => void
  onCreate?: () => void
}

const ArtistList = ({ onEdit, onDelete, onVerify, onView, onCreate }: ArtistListProps) => {
  const { artists, pagination, loading, error, fetchArtists } = useArtist()
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)

  // Load artists on mount
  useEffect(() => {
    fetchArtists(1, 15)
  }, [])

  // Filter artists based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredArtists(artists)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = artists.filter((artist: Artist) => 
        artist.name.toLowerCase().includes(query) ||
        artist.bio?.toLowerCase().includes(query)
      )
      setFilteredArtists(filtered)
    }
  }, [searchQuery, artists])

  const handlePageChange = async (page: number) => {
    setCurrentPage(page)
    await fetchArtists(page, itemsPerPage)
  }

  const handlePerPageChange = async (perPage: number) => {
    setItemsPerPage(perPage)
    setCurrentPage(1)
    await fetchArtists(1, perPage)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  return (
    <Box>
      {/* Search Card */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          title='Rechercher des artistes'
          action={
            onCreate && (
              <Button
                variant='contained'
                startIcon={<i className='tabler-plus' />}
                onClick={onCreate}
              >
                Ajouter un artiste
              </Button>
            )
          }
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 8, md: 9 }}>
              <CustomTextField
                fullWidth
                label='Rechercher'
                placeholder='Rechercher par nom ou biographie'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <Box display='flex' gap={2} height='100%' alignItems='center'>
                <Button
                  variant='tonal'
                  color='secondary'
                  onClick={handleClearSearch}
                  disabled={!searchQuery}
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
      {!loading && filteredArtists.length === 0 && (
        <Card>
          <CardContent>
            <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' minHeight={200} gap={2}>
              <i className='tabler-user-off' style={{ fontSize: 48, opacity: 0.5 }} />
              <Typography variant='h6' color='text.secondary'>
                Aucun artiste trouvé
              </Typography>
              <Typography variant='body2' color='text.disabled'>
                {searchQuery 
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Ajoutez un nouvel artiste pour commencer'
                }
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Artist Grid */}
      {!loading && filteredArtists.length > 0 && (
        <>
          <Grid container spacing={3}>
            {filteredArtists.map((artist) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={artist.id}>
                <ArtistCard
                  artist={artist}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onVerify={onVerify}
                  onView={onView}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination && !searchQuery && (
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

export default ArtistList
