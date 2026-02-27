import type { Music, MusicListResponse } from '@/types/music.types'
import { describe, expect, it } from 'vitest'
import musicReducer, {
    addMusic,
    clearError,
    removeMusic,
    setError,
    setLoading,
    setMusics,
    updateMusic
} from '../musicSlice'

describe('musicSlice', () => {
  const initialState = {
    musics: [],
    pagination: null,
    loading: false,
    error: null
  }

  const mockMusic: Music = {
    id: 1,
    title: 'Test Song',
    duration: 180,
    status: 'pending',
    artists: [],
    genres: []
  }

  const mockMusicListResponse: MusicListResponse = {
    status: 'success',
    data: [mockMusic],
    pagination: {
      current_page: 1,
      per_page: 10,
      total: 1,
      last_page: 1
    }
  }

  it('should return the initial state', () => {
    expect(musicReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should handle setMusics', () => {
    const actual = musicReducer(initialState, setMusics(mockMusicListResponse))
    expect(actual.musics).toEqual([mockMusic])
    expect(actual.pagination).toEqual(mockMusicListResponse.pagination)
    expect(actual.loading).toBe(false)
    expect(actual.error).toBe(null)
  })

  it('should handle addMusic', () => {
    const newMusic: Music = {
      id: 2,
      title: 'New Song',
      duration: 200,
      status: 'approved',
      artists: [],
      genres: []
    }

    const stateWithMusic = {
      ...initialState,
      musics: [mockMusic],
      pagination: { current_page: 1, per_page: 10, total: 1, last_page: 1 }
    }

    const actual = musicReducer(stateWithMusic, addMusic(newMusic))
    expect(actual.musics).toHaveLength(2)
    expect(actual.musics[0]).toEqual(newMusic)
    expect(actual.pagination?.total).toBe(2)
  })

  it('should handle updateMusic', () => {
    const updatedMusic: Music = {
      ...mockMusic,
      title: 'Updated Song',
      status: 'approved'
    }

    const stateWithMusic = {
      ...initialState,
      musics: [mockMusic]
    }

    const actual = musicReducer(stateWithMusic, updateMusic(updatedMusic))
    expect(actual.musics[0].title).toBe('Updated Song')
    expect(actual.musics[0].status).toBe('approved')
  })

  it('should handle removeMusic', () => {
    const stateWithMusic = {
      ...initialState,
      musics: [mockMusic],
      pagination: { current_page: 1, per_page: 10, total: 1, last_page: 1 }
    }

    const actual = musicReducer(stateWithMusic, removeMusic(1))
    expect(actual.musics).toHaveLength(0)
    expect(actual.pagination?.total).toBe(0)
  })

  it('should handle setLoading', () => {
    const actual = musicReducer(initialState, setLoading(true))
    expect(actual.loading).toBe(true)
  })

  it('should handle setError', () => {
    const errorMessage = 'Failed to fetch musics'
    const actual = musicReducer(initialState, setError(errorMessage))
    expect(actual.error).toBe(errorMessage)
    expect(actual.loading).toBe(false)
  })

  it('should handle clearError', () => {
    const stateWithError = {
      ...initialState,
      error: 'Some error'
    }

    const actual = musicReducer(stateWithError, clearError())
    expect(actual.error).toBe(null)
  })

  it('should not update music if id does not exist', () => {
    const updatedMusic: Music = {
      id: 999,
      title: 'Non-existent Song',
      duration: 200,
      status: 'approved',
      artists: [],
      genres: []
    }

    const stateWithMusic = {
      ...initialState,
      musics: [mockMusic]
    }

    const actual = musicReducer(stateWithMusic, updateMusic(updatedMusic))
    expect(actual.musics).toHaveLength(1)
    expect(actual.musics[0]).toEqual(mockMusic)
  })
})
