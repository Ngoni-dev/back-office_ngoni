// Third-party Imports
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

// Type Imports
import type { Artist, ArtistListResponse } from '@/types/artist.types'

interface ArtistState {
  artists: Artist[]
  pagination: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  } | null
  loading: boolean
  error: string | null
}

const initialState: ArtistState = {
  artists: [],
  pagination: null,
  loading: false,
  error: null
}

export const artistSlice = createSlice({
  name: 'artist',
  initialState,
  reducers: {
    setArtists: (state, action: PayloadAction<ArtistListResponse>) => {
      state.artists = action.payload.data
      state.pagination = action.payload.meta || null
      state.loading = false
      state.error = null
    },
    addArtist: (state, action: PayloadAction<Artist>) => {
      state.artists.unshift(action.payload)
      if (state.pagination) {
        state.pagination.total += 1
      }
    },
    updateArtist: (state, action: PayloadAction<Artist>) => {
      const index = state.artists.findIndex(artist => artist.id === action.payload.id)
      if (index !== -1) {
        state.artists[index] = action.payload
      }
    },
    removeArtist: (state, action: PayloadAction<number>) => {
      state.artists = state.artists.filter(artist => artist.id !== action.payload)
      if (state.pagination) {
        state.pagination.total -= 1
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    clearError: state => {
      state.error = null
    }
  }
})

export const { setArtists, addArtist, updateArtist, removeArtist, setLoading, setError, clearError } =
  artistSlice.actions
export default artistSlice.reducer
