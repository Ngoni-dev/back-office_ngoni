// Third-party Imports
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

// Type Imports
import type { Music, MusicListResponse } from '@/types/music.types'

interface MusicState {
  musics: Music[]
  pagination: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  } | null
  loading: boolean
  error: string | null
}

const initialState: MusicState = {
  musics: [],
  pagination: null,
  loading: false,
  error: null
}

export const musicSlice = createSlice({
  name: 'music',
  initialState,
  reducers: {
    setMusics: (state, action: PayloadAction<MusicListResponse>) => {
      state.musics = action.payload.data
      state.pagination = action.payload.pagination || null
      state.loading = false
      state.error = null
    },
    addMusic: (state, action: PayloadAction<Music>) => {
      state.musics.unshift(action.payload)
      if (state.pagination) {
        state.pagination.total += 1
      }
    },
    updateMusic: (state, action: PayloadAction<Music>) => {
      const index = state.musics.findIndex(music => music.id === action.payload.id)
      if (index !== -1) {
        state.musics[index] = action.payload
      }
    },
    removeMusic: (state, action: PayloadAction<number>) => {
      state.musics = state.musics.filter(music => music.id !== action.payload)
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

export const { setMusics, addMusic, updateMusic, removeMusic, setLoading, setError, clearError } = musicSlice.actions
export default musicSlice.reducer
