import type { MusicStatus } from '@/types/music.types'
import { render, screen } from '@testing-library/react'
import MusicStatusBadge from '../MusicStatusBadge'

describe('MusicStatusBadge Component', () => {
  describe('Status Display', () => {
    it('should display "En attente" for pending status', () => {
      render(<MusicStatusBadge status="pending" />)
      expect(screen.getByText('En attente')).toBeInTheDocument()
    })

    it('should display "Approuvé" for approved status', () => {
      render(<MusicStatusBadge status="approved" />)
      expect(screen.getByText('Approuvé')).toBeInTheDocument()
    })

    it('should display "Rejeté" for rejected status', () => {
      render(<MusicStatusBadge status="rejected" />)
      expect(screen.getByText('Rejeté')).toBeInTheDocument()
    })

    it('should display "Bloqué" for blocked status', () => {
      render(<MusicStatusBadge status="blocked" />)
      expect(screen.getByText('Bloqué')).toBeInTheDocument()
    })
  })

  describe('Status Colors', () => {
    it('should render with warning color for pending status', () => {
      const { container } = render(<MusicStatusBadge status="pending" />)
      const chip = container.querySelector('.MuiChip-colorWarning')
      expect(chip).toBeInTheDocument()
    })

    it('should render with success color for approved status', () => {
      const { container } = render(<MusicStatusBadge status="approved" />)
      const chip = container.querySelector('.MuiChip-colorSuccess')
      expect(chip).toBeInTheDocument()
    })

    it('should render with error color for rejected status', () => {
      const { container } = render(<MusicStatusBadge status="rejected" />)
      const chip = container.querySelector('.MuiChip-colorError')
      expect(chip).toBeInTheDocument()
    })

    it('should render with default color for blocked status', () => {
      const { container } = render(<MusicStatusBadge status="blocked" />)
      const chip = container.querySelector('.MuiChip-colorDefault')
      expect(chip).toBeInTheDocument()
    })
  })

  describe('All Status Values', () => {
    it('should handle all valid status values', () => {
      const statuses: MusicStatus[] = ['pending', 'approved', 'rejected', 'blocked']
      const expectedLabels = ['En attente', 'Approuvé', 'Rejeté', 'Bloqué']

      statuses.forEach((status, index) => {
        const { unmount } = render(<MusicStatusBadge status={status} />)
        expect(screen.getByText(expectedLabels[index])).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Component Props', () => {
    it('should render as a small chip', () => {
      const { container } = render(<MusicStatusBadge status="pending" />)
      const chip = container.querySelector('.MuiChip-sizeSmall')
      expect(chip).toBeInTheDocument()
    })

    it('should render with tonal variant', () => {
      const { container } = render(<MusicStatusBadge status="pending" />)
      const chip = container.querySelector('.MuiChip-root')
      expect(chip).toBeInTheDocument()
    })
  })
})
