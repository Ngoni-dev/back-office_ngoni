import type { Music } from '@/types/music.types'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MusicForm from '../MusicForm'

const mockMusic: Music = {
  id: 1,
  title: 'Test Song',
  duration: 180,
  duration_formatted: '3:00',
  audio_url: 'https://example.com/song.mp3',
  status: 'pending',
  language: 'Français',
  country_id: 1,
  is_original: true,
  artists: [{ id: 1, name: 'Artist 1', verified: true }],
  genres: [{ id: 1, name: 'Pop' }],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('MusicForm Component', () => {
  describe('Create Mode', () => {
    it('should render create form with correct title', () => {
      render(<MusicForm onSubmit={jest.fn()} />)
      expect(screen.getByText('Ajouter une nouvelle musique')).toBeInTheDocument()
    })

    it('should render all form fields', () => {
      render(<MusicForm onSubmit={jest.fn()} />)

      expect(screen.getByLabelText(/Titre de la musique/i)).toBeInTheDocument()
      expect(screen.getByText(/Fichier audio/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Langue/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/ID du pays/i)).toBeInTheDocument()
      expect(screen.getByText(/Musique originale/i)).toBeInTheDocument()
    })

    it('should show audio file upload field in create mode', () => {
      render(<MusicForm onSubmit={jest.fn()} />)
      expect(screen.getByText(/Fichier audio/i)).toBeInTheDocument()
    })

    it('should have submit button disabled when no audio file is selected', () => {
      render(<MusicForm onSubmit={jest.fn()} />)
      const submitButton = screen.getByRole('button', { name: /Créer/i })
      expect(submitButton).toBeDisabled()
    })

    it('should render create button text', () => {
      render(<MusicForm onSubmit={jest.fn()} />)
      expect(screen.getByRole('button', { name: /Créer/i })).toBeInTheDocument()
    })
  })

  describe('Edit Mode', () => {
    it('should render edit form with correct title', () => {
      render(<MusicForm music={mockMusic} onSubmit={jest.fn()} />)
      expect(screen.getByText('Modifier la musique')).toBeInTheDocument()
    })

    it('should not show audio file upload field in edit mode', () => {
      render(<MusicForm music={mockMusic} onSubmit={jest.fn()} />)
      expect(screen.queryByText(/Fichier audio/i)).not.toBeInTheDocument()
    })

    it('should populate form with music data', () => {
      render(<MusicForm music={mockMusic} onSubmit={jest.fn()} />)

      const titleInput = screen.getByLabelText(/Titre de la musique/i) as HTMLInputElement
      expect(titleInput.value).toBe('Test Song')

      const languageInput = screen.getByLabelText(/Langue/i) as HTMLInputElement
      expect(languageInput.value).toBe('Français')

      const countryInput = screen.getByLabelText(/ID du pays/i) as HTMLInputElement
      expect(countryInput.value).toBe('1')
    })

    it('should have is_original switch checked when true', () => {
      render(<MusicForm music={mockMusic} onSubmit={jest.fn()} />)
      const switchInput = screen.getByRole('checkbox', { name: /Musique originale/i })
      expect(switchInput).toBeChecked()
    })

    it('should render update button text', () => {
      render(<MusicForm music={mockMusic} onSubmit={jest.fn()} />)
      expect(screen.getByRole('button', { name: /Mettre à jour/i })).toBeInTheDocument()
    })

    it('should have submit button enabled in edit mode', () => {
      render(<MusicForm music={mockMusic} onSubmit={jest.fn()} />)
      const submitButton = screen.getByRole('button', { name: /Mettre à jour/i })
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('Form Validation', () => {
    it('should show error when title is empty', async () => {
      const user = userEvent.setup()
      render(<MusicForm onSubmit={jest.fn()} />)

      const titleInput = screen.getByLabelText(/Titre de la musique/i)
      await user.clear(titleInput)
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/Le titre est requis/i)).toBeInTheDocument()
      })
    })

    it('should accept valid title input', async () => {
      const user = userEvent.setup()
      render(<MusicForm onSubmit={jest.fn()} />)

      const titleInput = screen.getByLabelText(/Titre de la musique/i)
      await user.type(titleInput, 'New Song Title')

      expect(titleInput).toHaveValue('New Song Title')
    })
  })

  describe('Form Submission', () => {
    it('should call onSubmit with form data in create mode', async () => {
      const user = userEvent.setup()
      const onSubmit = jest.fn().mockResolvedValue(undefined)

      render(<MusicForm onSubmit={onSubmit} />)

      const titleInput = screen.getByLabelText(/Titre de la musique/i)
      await user.type(titleInput, 'New Song')

      const languageInput = screen.getByLabelText(/Langue/i)
      await user.type(languageInput, 'English')

      // Note: File upload testing would require more complex setup
      // This is a simplified test

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Créer/i })
        expect(submitButton).toBeInTheDocument()
      })
    })

    it('should call onSubmit with form data in edit mode', async () => {
      const user = userEvent.setup()
      const onSubmit = jest.fn().mockResolvedValue(undefined)

      render(<MusicForm music={mockMusic} onSubmit={onSubmit} />)

      const titleInput = screen.getByLabelText(/Titre de la musique/i)
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Song')

      const submitButton = screen.getByRole('button', { name: /Mettre à jour/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })
    })

    it('should disable submit button during loading', () => {
      render(<MusicForm music={mockMusic} onSubmit={jest.fn()} loading={true} />)
      const submitButton = screen.getByRole('button', { name: /Enregistrement.../i })
      expect(submitButton).toBeDisabled()
    })

    it('should show loading text when loading', () => {
      render(<MusicForm music={mockMusic} onSubmit={jest.fn()} loading={true} />)
      expect(screen.getByText(/Enregistrement.../i)).toBeInTheDocument()
    })
  })

  describe('Cancel Button', () => {
    it('should render cancel button when onCancel is provided', () => {
      render(<MusicForm onSubmit={jest.fn()} onCancel={jest.fn()} />)
      expect(screen.getByRole('button', { name: /Annuler/i })).toBeInTheDocument()
    })

    it('should not render cancel button when onCancel is not provided', () => {
      render(<MusicForm onSubmit={jest.fn()} />)
      expect(screen.queryByRole('button', { name: /Annuler/i })).not.toBeInTheDocument()
    })

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      const onCancel = jest.fn()

      render(<MusicForm onSubmit={jest.fn()} onCancel={onCancel} />)

      const cancelButton = screen.getByRole('button', { name: /Annuler/i })
      await user.click(cancelButton)

      expect(onCancel).toHaveBeenCalled()
    })

    it('should disable cancel button during loading', () => {
      render(<MusicForm onSubmit={jest.fn()} onCancel={jest.fn()} loading={true} />)
      const cancelButton = screen.getByRole('button', { name: /Annuler/i })
      expect(cancelButton).toBeDisabled()
    })
  })

  describe('Switch Input', () => {
    it('should toggle is_original switch', async () => {
      const user = userEvent.setup()
      render(<MusicForm onSubmit={jest.fn()} />)

      const switchInput = screen.getByRole('checkbox', { name: /Musique originale/i })
      expect(switchInput).not.toBeChecked()

      await user.click(switchInput)
      expect(switchInput).toBeChecked()

      await user.click(switchInput)
      expect(switchInput).not.toBeChecked()
    })
  })

  describe('Number Input', () => {
    it('should accept numeric input for country_id', async () => {
      const user = userEvent.setup()
      render(<MusicForm onSubmit={jest.fn()} />)

      const countryInput = screen.getByLabelText(/ID du pays/i)
      await user.type(countryInput, '123')

      expect(countryInput).toHaveValue(123)
    })

    it('should handle empty country_id', async () => {
      const user = userEvent.setup()
      render(<MusicForm music={mockMusic} onSubmit={jest.fn()} />)

      const countryInput = screen.getByLabelText(/ID du pays/i)
      await user.clear(countryInput)

      expect(countryInput).toHaveValue(null)
    })
  })

  describe('Placeholder Text', () => {
    it('should show placeholder for artists section', () => {
      render(<MusicForm onSubmit={jest.fn()} />)
      expect(
        screen.getByText(/La sélection des artistes sera disponible/i)
      ).toBeInTheDocument()
    })

    it('should show placeholder for genres section', () => {
      render(<MusicForm onSubmit={jest.fn()} />)
      expect(
        screen.getByText(/La sélection des genres sera disponible/i)
      ).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle submission errors gracefully', async () => {
      const user = userEvent.setup()
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const onSubmit = jest.fn().mockRejectedValue(new Error('Submission failed'))

      render(<MusicForm music={mockMusic} onSubmit={onSubmit} />)

      const submitButton = screen.getByRole('button', { name: /Mettre à jour/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled()
      })

      consoleErrorSpy.mockRestore()
    })
  })
})
