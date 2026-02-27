/**
 * useArtist Hook
 * Custom hook for managing artist operations with Redux state
 */

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// Service Imports
import { artistService } from '@/services/artist.service'

// Redux Actions
import {
    addArtist,
    removeArtist,
    setArtists,
    setError,
    setLoading,
    updateArtist as updateArtistAction
} from '@/redux-store/slices/artistSlice'

// Type Imports
import type { RootState } from '@/redux-store/store'
import type {
    ArtistCreateRequest,
    ArtistUpdateRequest,
    AttachArtistRequest
} from '@/types/artist.types'

export function useArtist() {
  const dispatch = useDispatch()
  const { artists, pagination, loading, error } = useSelector((state: RootState) => state.artist)
  const [uploading, setUploading] = useState(false)

  /**
   * Fetch paginated list of artists
   */
  const fetchArtists = async (page = 1, perPage = 15) => {
    try {
      dispatch(setLoading(true))
      const response = await artistService.list(page, perPage)
      dispatch(setArtists(response))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch artists'
      dispatch(setError(errorMessage))
      throw err
    }
  }

  /**
   * Create a new artist with file upload
   */
  const createArtist = async (data: ArtistCreateRequest) => {
    setUploading(true)
    try {
      dispatch(setLoading(true))
      const response = await artistService.create(data)
      dispatch(addArtist(response.data))
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create artist'
      dispatch(setError(errorMessage))
      throw err
    } finally {
      setUploading(false)
    }
  }

  /**
   * Update an existing artist
   */
  const updateArtist = async (id: number, data: ArtistUpdateRequest) => {
    try {
      dispatch(setLoading(true))
      const response = await artistService.update(id, data)
      dispatch(updateArtistAction(response.data))
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update artist'
      dispatch(setError(errorMessage))
      throw err
    }
  }

  /**
   * Delete an artist
   */
  const deleteArtist = async (id: number) => {
    try {
      dispatch(setLoading(true))
      await artistService.delete(id)
      dispatch(removeArtist(id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete artist'
      dispatch(setError(errorMessage))
      throw err
    }
  }

  /**
   * Verify an artist
   */
  const verifyArtist = async (id: number) => {
    try {
      dispatch(setLoading(true))
      const response = await artistService.verify(id)
      dispatch(updateArtistAction(response.data))
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify artist'
      dispatch(setError(errorMessage))
      throw err
    }
  }

  /**
   * Attach an artist to a music
   */
  const attachToMusic = async (data: AttachArtistRequest) => {
    try {
      dispatch(setLoading(true))
      await artistService.attachToMusic(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to attach artist to music'
      dispatch(setError(errorMessage))
      throw err
    }
  }

  /**
   * Detach an artist from a music
   */
  const detachFromMusic = async (musicId: number, artistId: number) => {
    try {
      dispatch(setLoading(true))
      await artistService.detachFromMusic(musicId, artistId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to detach artist from music'
      dispatch(setError(errorMessage))
      throw err
    }
  }

  return {
    // State
    artists,
    pagination,
    loading,
    error,
    uploading,

    // Actions
    fetchArtists,
    createArtist,
    updateArtist,
    deleteArtist,
    verifyArtist,
    attachToMusic,
    detachFromMusic
  }
}
