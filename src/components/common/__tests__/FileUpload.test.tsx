import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import FileUpload from '../FileUpload'

describe('FileUpload Component', () => {
  it('should render the upload area with default label', () => {
    const mockOnFileSelect = jest.fn()

    render(<FileUpload onFileSelect={mockOnFileSelect} />)

    expect(screen.getByText(/Glissez-déposez un fichier ici/i)).toBeInTheDocument()
  })

  it('should render with custom label', () => {
    const mockOnFileSelect = jest.fn()
    const customLabel = 'Upload your audio file'

    render(<FileUpload onFileSelect={mockOnFileSelect} label={customLabel} />)

    expect(screen.getByText(customLabel)).toBeInTheDocument()
  })

  it('should display helper text when provided', () => {
    const mockOnFileSelect = jest.fn()
    const helperText = 'Maximum file size: 10MB'

    render(<FileUpload onFileSelect={mockOnFileSelect} helperText={helperText} />)

    expect(screen.getByText(helperText)).toBeInTheDocument()
  })

  it('should display selected file information', () => {
    const mockOnFileSelect = jest.fn()
    const mockFile = new File(['test'], 'test.mp3', { type: 'audio/mpeg' })

    render(<FileUpload onFileSelect={mockOnFileSelect} currentFile={mockFile} />)

    expect(screen.getByText(/test.mp3/i)).toBeInTheDocument()
  })

  it('should call onFileSelect when a valid file is dropped', async () => {
    const mockOnFileSelect = jest.fn()
    const mockFile = new File(['test'], 'test.mp3', { type: 'audio/mpeg' })

    render(
      <FileUpload
        onFileSelect={mockOnFileSelect}
        accept={{ 'audio/*': ['.mp3', '.wav'] }}
        maxSize={10 * 1024 * 1024}
      />
    )

    const input = screen.getByRole('presentation').querySelector('input[type="file"]')

    if (input) {
      fireEvent.change(input, { target: { files: [mockFile] } })

      await waitFor(() => {
        expect(mockOnFileSelect).toHaveBeenCalledWith(mockFile)
      })
    }
  })

  it('should display error message for invalid file size', async () => {
    const mockOnFileSelect = jest.fn()
    const largeFile = new File(['x'.repeat(100 * 1024 * 1024)], 'large.mp3', { type: 'audio/mpeg' })

    render(<FileUpload onFileSelect={mockOnFileSelect} maxSize={10 * 1024 * 1024} />)

    const input = screen.getByRole('presentation').querySelector('input[type="file"]')

    if (input) {
      fireEvent.change(input, { target: { files: [largeFile] } })

      await waitFor(() => {
        expect(screen.getByText(/File size exceeds/i)).toBeInTheDocument()
      })
    }
  })

  it('should show progress bar when uploading', () => {
    const mockOnFileSelect = jest.fn()

    render(<FileUpload onFileSelect={mockOnFileSelect} showProgress={true} />)

    // Progress bar should not be visible initially
    expect(screen.queryByText(/Upload en cours/i)).not.toBeInTheDocument()
  })

  it('should disable dropzone when disabled prop is true', () => {
    const mockOnFileSelect = jest.fn()

    render(<FileUpload onFileSelect={mockOnFileSelect} disabled={true} />)

    const dropzone = screen.getByRole('presentation')

    expect(dropzone).toHaveAttribute('aria-disabled', 'true')
  })

  it('should show clear button when file is selected', () => {
    const mockOnFileSelect = jest.fn()
    const mockFile = new File(['test'], 'test.mp3', { type: 'audio/mpeg' })

    render(<FileUpload onFileSelect={mockOnFileSelect} currentFile={mockFile} />)

    expect(screen.getByText(/Supprimer le fichier/i)).toBeInTheDocument()
  })

  it('should call onFileSelect with null when clear button is clicked', () => {
    const mockOnFileSelect = jest.fn()
    const mockFile = new File(['test'], 'test.mp3', { type: 'audio/mpeg' })

    render(<FileUpload onFileSelect={mockOnFileSelect} currentFile={mockFile} />)

    const clearButton = screen.getByText(/Supprimer le fichier/i)

    fireEvent.click(clearButton)

    expect(mockOnFileSelect).toHaveBeenCalledWith(null)
  })
})
