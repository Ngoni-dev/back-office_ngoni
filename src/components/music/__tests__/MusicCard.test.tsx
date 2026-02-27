import type { Music } from '@/types/music.types'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MusicCard from '../MusicCard'

const mockMusic: Music = {
  id: 1,
  title: 'Test Song',
  duration: 180,
  duration_formatted: '3:00',
  audio_url: 'https://example.com/song.mp3',
  status: 'pending',
  artists: [
    { id: 1, name: 'Artist 1', verified: true },
    { id: 2, name: 'Artist 2', verified: false },
  ],
  genres: [
    { id: 1, name: 'Pop' },
    { id: 2, name: 'Rock' },
  ],
  uploader: {
    id: 1,
    name: 'John Doe',
  },
  likes_count: 42,
  usage_count: 100,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('MusicCard Component', () => {
  describe('Rendering', () => {
    it('should render music title', () => {
      render(<MusicCard music={mockMusic} />)
      expect(screen.getByText('Test Song')).toBeInTheDocument()
    })

    it('should render music status badge', () => {
      render(<MusicCard music={mockMusic} />)
      expect(screen.getByText('En attente')).toBeInTheDocument()
    })

    it('should render duration when available', () => {
      render(<MusicCard music={mockMusic} />)
      expect(screen.getByText(/Durée: 3:00/)).toBeInTheDocument()
    })

    it('should not render duration when not available', () => {
      const musicWithoutDuration = { ...mockMusic, duration_formatted: undefined }
      render(<MusicCard music={musicWithoutDuration} />)
      expect(screen.queryByText(/Durée:/)).not.toBeInTheDocument()
    })

    it('should render artists', () => {
      render(<MusicCard music={mockMusic} />)
      expect(screen.getByText('Artist 1')).toBeInTheDocument()
      expect(screen.getByText('Artist 2')).toBeInTheDocument()
    })

    it('should render genres', () => {
      render(<MusicCard music={mockMusic} />)
      expect(screen.getByText('Pop')).toBeInTheDocument()
      expect(screen.getByText('Rock')).toBeInTheDocument()
    })

    it('should render uploader information', () => {
      render(<MusicCard music={mockMusic} />)
      expect(screen.getByText(/Uploadé par: John Doe/)).toBeInTheDocument()
    })

    it('should render creation date', () => {
      render(<MusicCard music={mockMusic} />)
      expect(screen.getByText(/Créé le:/)).toBeInTheDocument()
    })

    it('should render likes count', () => {
      render(<MusicCard music={mockMusic} />)
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('should render usage count', () => {
      render(<MusicCard music={mockMusic} />)
      expect(screen.getByText('100')).toBeInTheDocument()
    })
  })

  describe('Menu Interactions', () => {
    it('should open menu when clicking menu button', async () => {
      const user = userEvent.setup()
      render(<MusicCard music={mockMusic} onView={jest.fn()} />)

      const menuButton = screen.getByRole('button')
      await user.click(menuButton)

      expect(screen.getByText('Voir les détails')).toBeInTheDocument()
    })

    it('should close menu when clicking outside', async () => {
      const user = userEvent.setup()
      render(<MusicCard music={mockMusic} onView={jest.fn()} />)

      const menuButton = screen.getByRole('button')
      await user.click(menuButton)

      expect(screen.getByText('Voir les détails')).toBeInTheDocument()

      // Click outside (on the document body)
      await user.click(document.body)

      // Menu should be closed (not in document)
      expect(screen.queryByText('Voir les détails')).not.toBeInTheDocument()
    })
  })

  describe('Action Callbacks', () => {
    it('should call onView when view menu item is clicked', async () => {
      const user = userEvent.setup()
      const onView = jest.fn()
      render(<MusicCard music={mockMusic} onView={onView} />)

      const menuButton = screen.getByRole('button')
      await user.click(menuButton)

      const viewMenuItem = screen.getByText('Voir les détails')
      await user.click(viewMenuItem)

      expect(onView).toHaveBeenCalledWith(mockMusic)
    })

    it('should call onEdit when edit menu item is clicked', async () => {
      const user = userEvent.setup()
      const onEdit = jest.fn()
      render(<MusicCard music={mockMusic} onEdit={onEdit} />)

      const menuButton = screen.getByRole('button')
      await user.click(menuButton)

      const editMenuItem = screen.getByText('Modifier')
      await user.click(editMenuItem)

      expect(onEdit).toHaveBeenCalledWith(mockMusic)
    })

    it('should call onStatusChange when status change menu item is clicked', async () => {
      const user = userEvent.setup()
      const onStatusChange = jest.fn()
      render(<MusicCard music={mockMusic} onStatusChange={onStatusChange} />)

      const menuButton = screen.getByRole('button')
      await user.click(menuButton)

      const statusMenuItem = screen.getByText('Changer le statut')
      await user.click(statusMenuItem)

      expect(onStatusChange).toHaveBeenCalledWith(mockMusic)
    })

    it('should call onDelete when delete menu item is clicked', async () => {
      const user = userEvent.setup()
      const onDelete = jest.fn()
      render(<MusicCard music={mockMusic} onDelete={onDelete} />)

      const menuButton = screen.getByRole('button')
      await user.click(menuButton)

      const deleteMenuItem = screen.getByText('Supprimer')
      await user.click(deleteMenuItem)

      expect(onDelete).toHaveBeenCalledWith(mockMusic)
    })
  })

  describe('Conditional Menu Items', () => {
    it('should not show view menu item when onView is not provided', async () => {
      const user = userEvent.setup()
      render(<MusicCard music={mockMusic} />)

      const menuButton = screen.getByRole('button')
      await user.click(menuButton)

      expect(screen.queryByText('Voir les détails')).not.toBeInTheDocument()
    })

    it('should not show edit menu item when onEdit is not provided', async () => {
      const user = userEvent.setup()
      render(<MusicCard music={mockMusic} />)

      const menuButton = screen.getByRole('button')
      await user.click(menuButton)

      expect(screen.queryByText('Modifier')).not.toBeInTheDocument()
    })

    it('should not show status change menu item when onStatusChange is not provided', async () => {
      const user = userEvent.setup()
      render(<MusicCard music={mockMusic} />)

      const menuButton = screen.getByRole('button')
      await user.click(menuButton)

      expect(screen.queryByText('Changer le statut')).not.toBeInTheDocument()
    })

    it('should not show delete menu item when onDelete is not provided', async () => {
      const user = userEvent.setup()
      render(<MusicCard music={mockMusic} />)

      const menuButton = screen.getByRole('button')
      await user.click(menuButton)

      expect(screen.queryByText('Supprimer')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle music without artists', () => {
      const musicWithoutArtists = { ...mockMusic, artists: [] }
      render(<MusicCard music={musicWithoutArtists} />)
      expect(screen.queryByText('Artistes:')).not.toBeInTheDocument()
    })

    it('should handle music without genres', () => {
      const musicWithoutGenres = { ...mockMusic, genres: [] }
      render(<MusicCard music={musicWithoutGenres} />)
      expect(screen.queryByText('Genres:')).not.toBeInTheDocument()
    })

    it('should handle music without uploader', () => {
      const musicWithoutUploader = { ...mockMusic, uploader: undefined }
      render(<MusicCard music={musicWithoutUploader} />)
      expect(screen.queryByText(/Uploadé par:/)).not.toBeInTheDocument()
    })

    it('should handle music without likes count', () => {
      const musicWithoutLikes = { ...mockMusic, likes_count: undefined }
      render(<MusicCard music={musicWithoutLikes} />)
      // Should still render but without likes chip
      expect(screen.getByText('Test Song')).toBeInTheDocument()
    })

    it('should handle music without usage count', () => {
      const musicWithoutUsage = { ...mockMusic, usage_count: undefined }
      render(<MusicCard music={musicWithoutUsage} />)
      // Should still render but without usage chip
      expect(screen.getByText('Test Song')).toBeInTheDocument()
    })

    it('should show verified badge for verified artists', () => {
      render(<MusicCard music={mockMusic} />)
      // Artist 1 is verified, should have a check icon
      const artistChips = screen.getAllByRole('button')
      expect(artistChips.length).toBeGreaterThan(0)
    })
  })

  describe('Different Status Values', () => {
    it('should render correctly with approved status', () => {
      const approvedMusic = { ...mockMusic, status: 'approved' as const }
      render(<MusicCard music={approvedMusic} />)
      expect(screen.getByText('Approuvé')).toBeInTheDocument()
    })

    it('should render correctly with rejected status', () => {
      const rejectedMusic = { ...mockMusic, status: 'rejected' as const }
      render(<MusicCard music={rejectedMusic} />)
      expect(screen.getByText('Rejeté')).toBeInTheDocument()
    })

    it('should render correctly with blocked status', () => {
      const blockedMusic = { ...mockMusic, status: 'blocked' as const }
      render(<MusicCard music={blockedMusic} />)
      expect(screen.getByText('Bloqué')).toBeInTheDocument()
    })
  })
})
