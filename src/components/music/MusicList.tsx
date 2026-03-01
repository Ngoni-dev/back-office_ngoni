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
import MusicCard from './MusicCard'

// Hook Imports
import { useMusic } from '@/hooks/useMusic'

// Type Imports
import type { Music, MusicSearchParams, MusicStatus } from '@/types/music.types'

interface MusicListProps {
  onEdit?: (music: Music) => void
  onDelete?: (music: Music) => void
  onStatusChange?: (music: Music) => void
  onView?: (music: Music) => void
  onCreate?: () => void
}

const MusicList = ({ onEdit, onDelete, onStatusChange, onView, onCreate }: MusicListProps) => {
  const { musics, pagination, loading, error, fetchMusics, searchMusics } = useMusic()
  
  // Search state
  const [searchParams, setSearchParams] = useState<MusicSearchParams>({
    title: '',
    artist: '',
    genre: '',
    status: undefined,
    page: 1,
    per_page: 15
  })

  const [isSearching, setIsSearching] = useState(false)

  // Load musics on mount
  useEffect(() => {
    fetchMusics(1, 15)
  }, [])

  const handleSearch = async () => {
    setIsSearching(true)
    try {
      // Filter out empty search params
      const filteredParams = Object.entries(searchParams).reduce((acc, [key, value]) => {
        if (value !== '' && value !== undefined) {
          acc[key as keyof MusicSearchParams] = value
        }
        return acc
      }, {} as MusicSearchParams)

      if (Object.keys(filteredParams).length > 0) {
        await searchMusics(filteredParams)
      } else {
        await fetchMusics(searchParams.page || 1, searchParams.per_page || 15)
      }
    } finally {
      setIsSearching(false)
    }
  }

  const handleClearSearch = async () => {
    setSearchParams({
      title: '',
      artist: '',
      genre: '',
      status: undefined,
      page: 1,
      per_page: 15
    })
    await fetchMusics(1, 15)
  }

  const handlePageChange = async (page: number) => {
    setSearchParams(prev => ({ ...prev, page }))
    
    // Check if we have active search filters
    const hasFilters = searchParams.title || searchParams.artist || searchParams.genre || searchParams.status
    
    if (hasFilters) {
      await searchMusics({ ...searchParams, page })
    } else {
      await fetchMusics(page, searchParams.per_page || 15)
    }
  }

  const handlePerPageChange = async (perPage: number) => {
    setSearchParams(prev => ({ ...prev, per_page: perPage, page: 1 }))
    
    const hasFilters = searchParams.title || searchParams.artist || searchParams.genre || searchParams.status
    
    if (hasFilters) {
      await searchMusics({ ...searchParams, per_page: perPage, page: 1 })
    } else {
      await fetchMusics(1, perPage)
    }
  }

  return (
    <Box>
      {/* Search Card */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          title='Rechercher des musiques'
          action={
            onCreate && (
              <Button
                variant='contained'
                startIcon={<i className='tabler-plus' />}
                onClick={onCreate}
              >
                Ajouter une musique
              </Button>
            )
          }
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CustomTextField
                fullWidth
                label='Titre'
                placeholder='Rechercher par titre'
                value={searchParams.title}
                onChange={(e) => setSearchParams(prev => ({ ...prev, title: e.target.value }))}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CustomTextField
                fullWidth
                label='Artiste'
                placeholder='Rechercher par artiste'
                value={searchParams.artist}
                onChange={(e) => setSearchParams(prev => ({ ...prev, artist: e.target.value }))}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CustomTextField
                fullWidth
                label='Genre'
                placeholder='Rechercher par genre'
                value={searchParams.genre}
                onChange={(e) => setSearchParams(prev => ({ ...prev, genre: e.target.value }))}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={searchParams.status || ''}
                  label='Statut'
                  onChange={(e) => setSearchParams(prev => ({ 
                    ...prev, 
                    status: e.target.value as MusicStatus | undefined 
                  }))}
                >
                  <MenuItem value=''>Tous</MenuItem>
                  <MenuItem value='pending'>En attente</MenuItem>
                  <MenuItem value='approved'>Approuvé</MenuItem>
                  <MenuItem value='rejected'>Rejeté</MenuItem>
                  <MenuItem value='blocked'>Bloqué</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box display='flex' gap={2}>
                <Button
                  variant='contained'
                  onClick={handleSearch}
                  disabled={isSearching || loading}
                  startIcon={<i className='tabler-search' />}
                >
                  Rechercher
                </Button>
                <Button
                  variant='tonal'
                  color='secondary'
                  onClick={handleClearSearch}
                  disabled={isSearching || loading}
                  startIcon={<i className='tabler-x' />}
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
      {!loading && musics.length === 0 && (
        <Card>
          <CardContent>
            <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' minHeight={200} gap={2}>
              <i className='tabler-music-off' style={{ fontSize: 48, opacity: 0.5 }} />
              <Typography variant='h6' color='text.secondary'>
                Aucune musique trouvée
              </Typography>
              <Typography variant='body2' color='text.disabled'>
                Essayez de modifier vos critères de recherche ou ajoutez une nouvelle musique
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Music Grid */}
      {!loading && musics.length > 0 && (
        <>
          <Grid container spacing={3}>
            {musics.map((music: Music) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={music.id}>
                <MusicCard
                  music={music}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                  onView={onView}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination && (
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

export default MusicList
