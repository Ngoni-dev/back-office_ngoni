import { act, renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { useMusic } from '../useMusic'
import { musicService } from '@/services/music.service'
import musicReducer from '@/redux-store/slices/musicSlice'
import type { Music, MusicStatus } from '@/types/music.types'
import React from 'react'

// Mock the music service
jest.mock('@/services/music.service')

const mockMusicService = musicService as jest.Mocked<typeof musicService>

// Helper to create a wrapper with Redux store
const createWrapper = () => {
  const store = configureStore({
    reducer: {
      music: musicReducer,
    },
  })

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(Provider, { store }, children)
}

// Mock music data
const mockMusic: Music = {
  id: 1,
  title: 'Test Song',
  duration: 180,
  duration_formatted: '3:00',
  audio_url: 'https://example.com/song.mp3',
  status: 'pending',
  artists: [],
  genres: [],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockMusicListResponse = {
  data: [mockMusic],
  pagination: {
    current_page: 1,
    per_page: 15,
    total: 1,
    last_page: 1,
  },
}

describe('useMusic Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useMusic(), {
        wrapper: createWrapper(),
      })

      expect(result.current.musics).toEqual([])
      expect(result.current.pagination).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.uploading).toBe(false)
    })
  })

  describe('fetchMusics', () => {
    it('should fetch musics successfully', async () => {
      mockMusicService.list.mockResolvedValue(mockMusicListResponse)

      const { result } = renderHook(() => useMusic(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.fetchMusics(1, 15)
      })

      expect(mockMusicService.list).toHaveBeenCalledWith(1, 15)
      expect(result.current.musics).toEqual([mockMusic])
      expect(result.current.pagination).toEqual(mockMusicListResponse.pagination)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle fetch error', async () => {
      const errorMessage = 'Failed to fetch musics'
      mockMusicService.list.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useMusic(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        try {
          await result.current.fetchMusics()
        } catch (error) {
          // Expected error
        }
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.loading).toBe(false)
    })

    it('should use default pagination parameters', async () => {
      mockMusicService.list.mockResolvedValue(mockMusicListResponse)

      const { result } = renderHook(() => useMusic(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.fetchMusics()
      })

      expect(mockMusicService.list).toHaveBeenCalledWith(1, 15)
    })
  })

  describe('searchMusics', () => {
    it('should search musics with parameters', async () => {
      const searchParams = {
        query: 'test',
        status: 'approved' as MusicStatus,
        page: 1,
        per_page: 15,
      }

      mockMusicService.search.mockResolvedValue(mockMusicListResponse)

      const { result } = renderHook(() => useMusic(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.searchMusics(searchParams)
      })

      expect(mockMusicService.search).toHaveBeenCalledWith(searchParams)
      expect(result.current.musics).toEqual([mockMusic])
    })

    it('should handle search error', async () => {
      const errorMessage = 'Failed to search musics'
      mockMusicService.search.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useMusic(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        try {
          await result.current.searchMusics({ query: 'test' })
        } catch (error) {
          // Expected error
        }
      })

      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('createMusic', () => {
    it('should create music successfully', async () => {
      const createRequest = {
        title: 'New Song',
        audio_file: new File([''], 'song.mp3', { type: 'audio/mpeg' }),
      }

      mockMusicService.create.mockResolvedValue({ data: mockMusic })

      const { result } = renderHook(() => useMusic(), {
        wrapper: createWrapper(),
      })

      let createdMusic: Music | undefined

      await act(async () => {
        createdMusic = await result.current.createMusic(createRequest)
      })

      expect(mockMusicService.create).toHaveBeenCalledWith(createRequest)
      expect(createdMusic).toEqual(mockMusic)
      expect(result.current.musics).toContainEqual(mockMusic)
      expect(result.current.uploading).toBe(false)
    })

    it('should set uploading state during creation', async () => {
      const createRequest = {
        title: 'New Song',
        audio_file: new File([''], 'song.mp3', { type: 'audio/mpeg' }),
      }

      mockMusicService.create.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ data: mockMusic }), 100)
          })
      )

      const { result } = renderHook(() => useMusic(), {
        wrapper: createWrapper(),
      })

      const createPromise = act(async () => {
        await result.current.createMusic(createRequest)
      })

      // Check uploading state is true during upload
      await waitFor(() => {
        expect(result.current.uploading).toBe(true)
      })

      await createPromise

      // Check uploading state is false after upload
      expect(result.current.uploading).toBe(false)
    })

    it('should handle create error', async () => {
      const errorMessage = 'Failed to create music'
      const createRequest = {
        title: 'New Song',
        audio_file: new File([''], 'song.mp3', { type: 'audio/mpeg' }),
      }

      mockMusicService.create.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useMusic(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        try {
          await result.current.createMusic(createRequest)
        } catch (error) {
          // Expected error
        }
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.uploading).toBe(false)
    })
  })

  describe('updateMusic', () => {
    it('should update music successfully', async () => {
      const updateRequest = {
        title: 'Updated Song',
      }

      const updatedMusic = { ...mockMusic, title: 'Updated Song' }
      mockMusicService.update.mockResolvedValue({ data: updatedMusic })

      // First, populate the store with the original music
      mockMusicService.list.mockResolvedValue(mockMusicListResponse)

      const { result } = renderHook(() => useMusic(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.fetchMusics()
      })

      await act(async () => {
        await result.current.updateMusic(1, updateRequest)
      })

      expect(mockMusicService.update).toHaveBeenCalledWith(1, updateRequest)
      expect(result.current.musics[0].title).toBe('Updated Song')
    })

    it('should handle update error', async () => {
      const errorMessage = 'Failed to update music'
      mockMusicService.update.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useMusic(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        try {
          await result.current.updateMusic(1, { title: 'Updated' })
        } catch (error) {
          // Expected error
        }
      })

      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('deleteMusic', () => {
    it('should delete music successfully', async () => {
      mockMusicService.delete.mockResolvedValue()
      mockMusicService.list.mockResolvedValue(mockMusicListResponse)

      const { result } = renderHook(() => useMusic(), {
        wrapper: createWrapper(),
      })

      // First, populate the store
      await act(async () => {
        await result.current.fetchMusics()
      })

      expect(result.current.musics).toHaveLength(1)

      // Then delete
      await act(async () => {
        await result.current.deleteMusic(1)
      })

      expect(mockMusicService.delete).toHaveBeenCalledWith(1)
      expect(result.current.musics).toHaveLength(0)
    })

    it('should handle delete error', async () => {
      const errorMessage = 'Failed to delete music'
      mockMusicService.delete.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useMusic(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        try {
          await result.current.deleteMusic(1)
        } catch (error) {
          // Expected error
        }
      })

      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('updateMusicStatus', () => {
    it('should update music status successfully', async () => {
      const newStatus: MusicStatus = 'approved'
      const updatedMusic = { ...mockMusic, status: newStatus }
      mockMusicService.updateStatus.mockResolvedValue({ data: updatedMusic })
      mockMusicService.list.mockResolvedValue(mockMusicListResponse)

      const { result } = renderHook(() => useMusic(), {
        wrapper: createWrapper(),
      })

      // First, populate the store
      await act(async () => {
        await result.current.fetchMusics()
      })

      // Then update status
      await act(async () => {
        await result.current.updateMusicStatus(1, newStatus)
      })

      expect(mockMusicService.updateStatus).toHaveBeenCalledWith(1, newStatus)
      expect(result.current.musics[0].status).toBe('approved')
    })

    it('should handle all valid status values', async () => {
      const statuses: MusicStatus[] = ['pending', 'approved', 'rejected', 'blocked']

      for (const status of statuses) {
        const updatedMusic = { ...mockMusic, status }
        mockMusicService.updateStatus.mockResolvedValue({ data: updatedMusic })

        const { result } = renderHook(() => useMusic(), {
          wrapper: createWrapper(),
        })

        await act(async () => {
          await result.current.updateMusicStatus(1, status)
        })

        expect(mockMusicService.updateStatus).toHaveBeenCalledWith(1, status)
      }
    })

    it('should handle status update error', async () => {
      const errorMessage = 'Failed to update music status'
      mockMusicService.updateStatus.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useMusic(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        try {
          await result.current.updateMusicStatus(1, 'approved')
        } catch (error) {
          // Expected error
        }
      })

      expect(result.current.error).toBe(errorMessage)
    })
  })
})
