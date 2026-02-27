// Third-party Imports
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

// Type Imports
import type { Genre, GenreListResponse } from '@/types/genre.types'

interface GenreState {
  genres: Genre[]
  loading: boolean
  error: string | null
}

const initialState: GenreState = {
  genres: [],
  loading: false,
  error: null
}

export const genreSlice = createSlice({
  name: 'genre',
  initialState,
  reducers: {
    setGenres: (state, action: PayloadAction<GenreListResponse>) => {
      state.genres = action.payload.data
      state.loading = false
      state.error = null
    },
    addGenre: (state, action: PayloadAction<Genre>) => {
      state.genres.unshift(action.payload)
    },
    updateGenre: (state, action: PayloadAction<Genre>) => {
      const index = state.genres.findIndex(genre => genre.id === action.payload.id)
      if (index !== -1) {
        state.genres[index] = action.payload
      }
    },
    removeGenre: (state, action: PayloadAction<number>) => {
      state.genres = state.genres.filter(genre => genre.id !== action.payload)
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

export const { setGenres, addGenre, updateGenre, removeGenre, setLoading, setError, clearError } =
  genreSlice.actions
export default genreSlice.reducer
