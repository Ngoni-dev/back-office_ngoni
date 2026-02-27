import type { Artist, ArtistListResponse } from '@/types/artist.types'
import { describe, expect, it } from 'vitest'
import artistReducer, {
    addArtist,
    clearError,
    removeArtist,
    setArtists,
    setError,
    setLoading,
    updateArtist
} from '../artistSlice'

describe('artistSlice', () => {
  const initialState = {
    artists: [],
    pagination: null,
    loading: false,
    error: null
  }

  const mockArtist: Artist = {
    id: 1,
    name: 'Test Artist',
    bio: 'Test bio',
    verified: false
  }

  const mockArtistListResponse: ArtistListResponse = {
    status: 'success',
    data: [mockArtist],
    meta: {
      current_page: 1,
      per_page: 10,
      total: 1,
      last_page: 1
    }
  }

  it('should return the initial state', () => {
    expect(artistReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should handle setArtists', () => {
    const actual = artistReducer(initialState, setArtists(mockArtistListResponse))
    expect(actual.artists).toEqual([mockArtist])
    expect(actual.pagination).toEqual(mockArtistListResponse.meta)
    expect(actual.loading).toBe(false)
    expect(actual.error).toBe(null)
  })

  it('should handle addArtist', () => {
    const newArtist: Artist = {
      id: 2,
      name: 'New Artist',
      bio: 'New bio',
      verified: true
    }

    const stateWithArtist = {
      ...initialState,
      artists: [mockArtist],
      pagination: { current_page: 1, per_page: 10, total: 1, last_page: 1 }
    }

    const actual = artistReducer(stateWithArtist, addArtist(newArtist))
    expect(actual.artists).toHaveLength(2)
    expect(actual.artists[0]).toEqual(newArtist)
    expect(actual.pagination?.total).toBe(2)
  })

  it('should handle updateArtist', () => {
    const updatedArtist: Artist = {
      ...mockArtist,
      name: 'Updated Artist',
      verified: true
    }

    const stateWithArtist = {
      ...initialState,
      artists: [mockArtist]
    }

    const actual = artistReducer(stateWithArtist, updateArtist(updatedArtist))
    expect(actual.artists[0].name).toBe('Updated Artist')
    expect(actual.artists[0].verified).toBe(true)
  })

  it('should handle removeArtist', () => {
    const stateWithArtist = {
      ...initialState,
      artists: [mockArtist],
      pagination: { current_page: 1, per_page: 10, total: 1, last_page: 1 }
    }

    const actual = artistReducer(stateWithArtist, removeArtist(1))
    expect(actual.artists).toHaveLength(0)
    expect(actual.pagination?.total).toBe(0)
  })

  it('should handle setLoading', () => {
    const actual = artistReducer(initialState, setLoading(true))
    expect(actual.loading).toBe(true)
  })

  it('should handle setError', () => {
    const errorMessage = 'Failed to fetch artists'
    const actual = artistReducer(initialState, setError(errorMessage))
    expect(actual.error).toBe(errorMessage)
    expect(actual.loading).toBe(false)
  })

  it('should handle clearError', () => {
    const stateWithError = {
      ...initialState,
      error: 'Some error'
    }

    const actual = artistReducer(stateWithError, clearError())
    expect(actual.error).toBe(null)
  })

  it('should not update artist if id does not exist', () => {
    const updatedArtist: Artist = {
      id: 999,
      name: 'Non-existent Artist',
      verified: false
    }

    const stateWithArtist = {
      ...initialState,
      artists: [mockArtist]
    }

    const actual = artistReducer(stateWithArtist, updateArtist(updatedArtist))
    expect(actual.artists).toHaveLength(1)
    expect(actual.artists[0]).toEqual(mockArtist)
  })
})
