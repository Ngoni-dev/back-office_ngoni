import { render, screen } from '@testing-library/react'
import Pagination from '../Pagination'

describe('Pagination Component', () => {
  const mockOnPageChange = jest.fn()
  const mockOnPerPageChange = jest.fn()

  const defaultProps = {
    page: 1,
    perPage: 10,
    onPageChange: mockOnPageChange,
    
    last_page: 5,
    per_page: 10,
    total: 50
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render pagination controls', () => {
      render(<Pagination {...defaultProps} meta={mockMeta} />)

      // Check if pagination buttons are rendered
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should display info text with correct values', () => {
      render(<Pagination {...defaultProps} meta={mockMeta} />)

      expect(screen.getByText(/Affichage de 1 à 10 sur 50 éléments/i)).toBeInTheDocument()
    })

    it('should display "Aucun élément" when total is 0', () => {
      const emptyMeta = { ...mockMeta, total: 0 }

      render(<Pagination {...defaultProps} meta={emptyMeta} />)

      expect(screen.getByText(/Aucun élément/i)).toBeInTheDocument()
    })

    it('should render per page selector with label', () => {
      render(<Pagination {...defaultProps} meta={mockMeta} />)

      expect(screen.getByText(/Éléments par page:/i)).toBeInTheDocument()
    })

    it('should hide per page selector when showPerPageSelector is false', () => {
      render(<Pagination {...defaultProps} meta={mockMeta} showPerPageSelector={false} />)

      expect(screen.queryByText(/Éléments par page:/i)).not.toBeInTheDocument()
    })

    it('should hide info text when showInfo is false', () => {
      render(<Pagination {...defaultProps} meta={mockMeta} showInfo={false} />)

      expect(screen.queryByText(/Affichage de/i)).not.toBeInTheDocument()
    })
  })

  describe('Info Text Calculations', () => {
    it('should calculate correct start and end items for first page', () => {
      render(<Pagination {...defaultProps} page={1} meta={mockMeta} />)

      expect(screen.getByText(/Affichage de 1 à 10 sur 50 éléments/i)).toBeInTheDocument()
    })

    it('should calculate correct start and end items for middle page', () => {
      const props = { ...defaultProps, page: 3 }
      const meta = { ...mockMeta, current_page: 3 }

      render(<Pagination {...props} meta={meta} />)

      expect(screen.getByText(/Affichage de 21 à 30 sur 50 éléments/i)).toBeInTheDocument()
    })

    it('should calculate correct start and end items for last page', () => {
      const props = { ...defaultProps, page: 5 }
      const meta = { ...mockMeta, current_page: 5 }

      render(<Pagination {...props} meta={meta} />)

      expect(screen.getByText(/Affichage de 41 à 50 sur 50 éléments/i)).toBeInTheDocument()
    })

    it('should handle partial last page correctly', () => {
      const props = { ...defaultProps, page: 3, perPage: 25 }
      const meta = {
        current_page: 3,
        last_page: 3,
        per_page: 25,
        total: 63
      }

      render(<Pagination {...props} meta={meta} />)

      expect(screen.getByText(/Affichage de 51 à 63 sur 63 éléments/i)).toBeInTheDocument()
    })
  })

  describe('Without Meta', () => {
    it('should work without meta prop', () => {
      render(<Pagination {...defaultProps} />)

      // Should render without errors
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should display "Aucun élément" when no meta provided', () => {
      render(<Pagination {...defaultProps} />)

      expect(screen.getByText(/Aucun élément/i)).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large total numbers', () => {
      const largeMeta = {
        current_page: 1,
        last_page: 1000,
        per_page: 10,
        total: 10000
      }

      render(<Pagination {...defaultProps} meta={largeMeta} />)

      expect(screen.getByText(/Affichage de 1 à 10 sur 10000 éléments/i)).toBeInTheDocument()
    })

    it('should handle single item', () => {
      const singleItemMeta = {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 1
      }

      render(<Pagination {...defaultProps} meta={singleItemMeta} />)

      expect(screen.getByText(/Affichage de 1 à 1 sur 1 éléments/i)).toBeInTheDocument()
    })

    it('should handle different perPage values correctly', () => {
      const props = { ...defaultProps, perPage: 25 }
      const meta = {
        current_page: 1,
        last_page: 2,
        per_page: 25,
        total: 50
      }

      render(<Pagination {...props} meta={meta} />)

      expect(screen.getByText(/Affichage de 1 à 25 sur 50 éléments/i)).toBeInTheDocument()
    })
  })
})
