/**
 * useGenre Hook
 * Custom hook for managing genre operations with Redux state
 */

import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'

// Service Imports
import { genreService } from '@/services/genre.service'

// Redux Actions
import {
    addGenre,
    removeGenre,
    setError,
    setGenres,
    setLoading,
    updateGenre as updateGenreAction
} from '@/redux-store/slices/genreSlice'

// Type Imports
import type { RootState } from '@/redux-store'
import type {
    AttachGenreRequest,
    GenreCreateRequest,
    GenreUpdateRequest
} from '@/types/genre.types'

export function useGenre() {
  const dispatch = useDispatch()
  const { genres, loading, error } = useSelector((state: RootState) => state.genre)

  /**
   * Fetch list of genres
   */
  const fetchGenres = async (page = 1, perPage = 50) => {
    try {
      dispatch(setLoading(true))
      const response = await genreService.list(page, perPage)
      dispatch(setGenres(response))
      toast.success('Genres loaded successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch genres'
      dispatch(setError(errorMessage))
      toast.error(errorMessage)
      throw err
    }
  }

  /**
   * Create a new genre
   */
  const createGenre = async (data: GenreCreateRequest) => {
    try {
      dispatch(setLoading(true))
      const response = await genreService.create(data)
      dispatch(addGenre(response.data))
      toast.success('Genre created successfully')
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create genre'
      dispatch(setError(errorMessage))
      toast.error(errorMessage)
      throw err
    }
  }

  /**
   * Update an existing genre
   */
  const updateGenre = async (id: number, data: GenreUpdateRequest) => {
    try {
      dispatch(setLoading(true))
      const response = await genreService.update(id, data)
      dispatch(updateGenreAction(response.data))
      toast.success('Genre updated successfully')
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update genre'
      dispatch(setError(errorMessage))
      toast.error(errorMessage)
      throw err
    }
  }

  /**
   * Delete a genre
   */
  const deleteGenre = async (id: number) => {
    try {
      dispatch(setLoading(true))
      await genreService.delete(id)
      dispatch(removeGenre(id))
      toast.success('Genre deleted successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete genre'
      dispatch(setError(errorMessage))
      toast.error(errorMessage)
      throw err
    }
  }

  /**
   * Attach a genre to a music
   */
  const attachToMusic = async (data: AttachGenreRequest) => {
    try {
      dispatch(setLoading(true))
      await genreService.attachToMusic(data)
      toast.success('Genre attached to music successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to attach genre to music'
      dispatch(setError(errorMessage))
      toast.error(errorMessage)
      throw err
    }
  }

  /**
   * Detach a genre from a music
   */
  const detachFromMusic = async (musicId: number, genreId: number) => {
    try {
      dispatch(setLoading(true))
      await genreService.detachFromMusic(musicId, genreId)
      toast.success('Genre detached from music successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to detach genre from music'
      dispatch(setError(errorMessage))
      toast.error(errorMessage)
      throw err
    }
  }

  return {
    // State
    genres,
    loading,
    error,

    // Actions
    fetchGenres,
    createGenre,
    updateGenre,
    deleteGenre,
    attachToMusic,
    detachFromMusic
  }
}
