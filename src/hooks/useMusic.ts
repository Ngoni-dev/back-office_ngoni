/**
 * useMusic Hook
 * Custom hook for managing music operations with Redux state
 */

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// Service Imports
import { musicService } from '@/services/music.service'

// Redux Actions
import {
    addMusic,
    removeMusic,
    setError,
    setLoading,
    setMusics,
    updateMusic as updateMusicAction
} from '@/redux-store/slices/musicSlice'

// Type Imports
import type { RootState } from '@/redux-store/store'
import type {
    MusicCreateRequest,
    MusicSearchParams,
    MusicStatus,
    MusicUpdateRequest
} from '@/types/music.types'

export function useMusic() {
  const dispatch = useDispatch()
  const { musics, pagination, loading, error } = useSelector((state: RootState) => state.music)
  const [uploading, setUploading] = useState(false)

  /**
   * Fetch paginated list of musics
   */
  const fetchMusics = async (page = 1, perPage = 15) => {
    try {
      dispatch(setLoading(true))
      const response = await musicService.list(page, perPage)
      dispatch(setMusics(response))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch musics'
      dispatch(setError(errorMessage))
      throw err
    }
  }

  /**
   * Search musics with advanced filters
   */
  const searchMusics = async (params: MusicSearchParams) => {
    try {
      dispatch(setLoading(true))
      const response = await musicService.search(params)
      dispatch(setMusics(response))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search musics'
      dispatch(setError(errorMessage))
      throw err
    }
  }

  /**
   * Create a new music with file upload
   */
  const createMusic = async (data: MusicCreateRequest) => {
    setUploading(true)
    try {
      dispatch(setLoading(true))
      const response = await musicService.create(data)
      dispatch(addMusic(response.data))
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create music'
      dispatch(setError(errorMessage))
      throw err
    } finally {
      setUploading(false)
    }
  }

  /**
   * Update an existing music
   */
  const updateMusic = async (id: number, data: MusicUpdateRequest) => {
    try {
      dispatch(setLoading(true))
      const response = await musicService.update(id, data)
      dispatch(updateMusicAction(response.data))
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update music'
      dispatch(setError(errorMessage))
      throw err
    }
  }

  /**
   * Delete a music
   */
  const deleteMusic = async (id: number) => {
    try {
      dispatch(setLoading(true))
      await musicService.delete(id)
      dispatch(removeMusic(id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete music'
      dispatch(setError(errorMessage))
      throw err
    }
  }

  /**
   * Update music status (pending, approved, rejected, blocked)
   */
  const updateMusicStatus = async (id: number, status: MusicStatus) => {
    try {
      dispatch(setLoading(true))
      const response = await musicService.updateStatus(id, status)
      dispatch(updateMusicAction(response.data))
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update music status'
      dispatch(setError(errorMessage))
      throw err
    }
  }

  return {
    // State
    musics,
    pagination,
    loading,
    error,
    uploading,

    // Actions
    fetchMusics,
    searchMusics,
    createMusic,
    updateMusic,
    deleteMusic,
    updateMusicStatus
  }
}
