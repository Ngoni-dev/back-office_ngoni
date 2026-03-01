'use client'

// React Imports
import { useCallback } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

// Third-party Imports
import { useDropzone } from 'react-dropzone'

// Hook Imports
import { useFileUpload } from '@/hooks/useFileUpload'

// Styled Components
const DropzoneWrapper = styled(Box)<{ isDragActive?: boolean; error?: boolean }>(({ theme, isDragActive, error }) => ({
  border: `2px dashed ${
    error
      ? 'var(--mui-palette-error-main)'
      : isDragActive
        ? 'var(--mui-palette-primary-main)'
        : 'var(--mui-palette-customColors-inputBorder)'
  }`,
  borderRadius: 'var(--mui-shape-borderRadius)',
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: theme.transitions.create(['border-color', 'background-color']),
  backgroundColor: isDragActive ? 'var(--mui-palette-action-hover)' : 'transparent',
  '&:hover': {
    borderColor: error ? 'var(--mui-palette-error-main)' : 'var(--mui-palette-primary-main)',
    backgroundColor: 'var(--mui-palette-action-hover)'
  }
}))

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: Record<string, string[]>
  maxSize?: number
  label?: string
  helperText?: string
  disabled?: boolean
  showProgress?: boolean
  currentFile?: File | null
  error?: boolean
  errorMessage?: string
}

const FileUpload = ({
  onFileSelect,
  accept,
  maxSize = 50 * 1024 * 1024, // Default 50MB
  label = 'Glissez-déposez un fichier ici ou cliquez pour sélectionner',
  helperText,
  disabled = false,
  showProgress = false,
  currentFile = null,
  error: errorProp = false,
  errorMessage: errorMessageProp
}: FileUploadProps) => {
  const { progress, uploading, error: internalError, validateFile, reset, setError } = useFileUpload()
  const error = errorProp || !!internalError
  const errorMessage = errorMessageProp || internalError

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]

      try {
        // Validate file: use MIME type keys from accept (e.g. 'audio/mpeg', 'audio/*')
        const allowedTypes = accept ? Object.keys(accept) : undefined

        validateFile(file, {
          maxSize,
          allowedTypes
        })

        // Reset any previous errors
        reset()

        // Call parent callback
        onFileSelect(file)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de validation du fichier')
      }
    },
    [accept, maxSize, onFileSelect, reset, setError, validateFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled: disabled || uploading
  })

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <Box>
      <DropzoneWrapper {...getRootProps()} isDragActive={isDragActive} error={!!error}>
        <input {...getInputProps()} />
        <Box display='flex' flexDirection='column' alignItems='center' gap={2}>
          <i className='tabler-upload' style={{ fontSize: '2.5rem', color: 'var(--mui-palette-text-secondary)' }} />
          <Typography variant='body1' color='text.primary'>
            {label}
          </Typography>
          {helperText && (
            <Typography variant='body2' color='text.secondary'>
              {helperText}
            </Typography>
          )}
          {currentFile && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 1,
                backgroundColor: 'var(--mui-palette-action-hover)',
                width: '100%'
              }}
            >
              <Typography variant='body2' color='text.primary'>
                <strong>Fichier sélectionné:</strong> {currentFile.name}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {formatFileSize(currentFile.size)}
              </Typography>
            </Box>
          )}
        </Box>
      </DropzoneWrapper>

      {/* Progress Bar */}
      {showProgress && uploading && progress && (
        <Box sx={{ mt: 2 }}>
          <Box display='flex' justifyContent='space-between' alignItems='center' mb={1}>
            <Typography variant='body2' color='text.secondary'>
              Upload en cours...
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {progress.percentage}%
            </Typography>
          </Box>
          <LinearProgress variant='determinate' value={progress.percentage} />
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Box sx={{ mt: 2 }}>
          <Typography variant='body2' color='error.main'>
            <i className='tabler-alert-circle' style={{ marginRight: '0.5rem' }} />
            {typeof errorMessage === 'string' ? errorMessage : 'Erreur de validation'}
          </Typography>
        </Box>
      )}

      {/* Clear Button */}
      {currentFile && !uploading && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            size='small'
            color='error'
            variant='outlined'
            onClick={() => {
              reset()
              onFileSelect(null as any)
            }}
          >
            Supprimer le fichier
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default FileUpload
