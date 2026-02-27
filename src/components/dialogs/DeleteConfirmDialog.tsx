'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'

export interface DeleteConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title?: string
  message: string
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirmer la suppression',
  message
}: DeleteConfirmDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth='xs' fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button
          variant='tonal'
          color='secondary'
          onClick={onClose}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          variant='contained'
          color='error'
          onClick={handleConfirm}
          disabled={loading}
          startIcon={loading ? <i className='tabler-loader animate-spin' /> : <i className='tabler-trash' />}
        >
          {loading ? 'Suppression...' : 'Supprimer'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
