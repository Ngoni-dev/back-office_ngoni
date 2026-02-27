'use client'

// React Imports
import { ChangeEvent } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import MuiPagination from '@mui/material/Pagination'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Typography from '@mui/material/Typography'

interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

interface PaginationProps {
  page: number
  perPage: number
  meta?: PaginationMeta
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  perPageOptions?: number[]
  showPerPageSelector?: boolean
  showInfo?: boolean
}

const Pagination = ({
  page,
  perPage,
  meta,
  onPageChange,
  onPerPageChange,
  perPageOptions = [10, 25, 50, 100],
  showPerPageSelector = true,
  showInfo = true
}: PaginationProps) => {
  const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
    onPageChange(value)
  }

  const handlePerPageChange = (event: SelectChangeEvent<number>) => {
    onPerPageChange(Number(event.target.value))
  }

  // Calculate display values
  const totalItems = meta?.total ?? 0
  const totalPages = meta?.last_page ?? Math.ceil(totalItems / perPage)
  const startItem = totalItems === 0 ? 0 : (page - 1) * perPage + 1
  const endItem = Math.min(page * perPage, totalItems)

  return (
    <Box
      className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'
      sx={{
        borderTop: '1px solid var(--mui-palette-divider)'
      }}
    >
      {/* Info Text */}
      {showInfo && (
        <Typography color='text.disabled' variant='body2'>
          {totalItems === 0
            ? 'Aucun élément'
            : `Affichage de ${startItem} à ${endItem} sur ${totalItems} éléments`}
        </Typography>
      )}

      {/* Pagination Controls */}
      <Box display='flex' alignItems='center' gap={2} flexWrap='wrap'>
        {/* Per Page Selector */}
        {showPerPageSelector && (
          <Box display='flex' alignItems='center' gap={1}>
            <Typography variant='body2' color='text.secondary'>
              Éléments par page:
            </Typography>
            <Select
              value={perPage}
              onChange={handlePerPageChange}
              size='small'
              sx={{
                minWidth: 80,
                '& .MuiSelect-select': {
                  py: 1
                }
              }}
            >
              {perPageOptions.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </Box>
        )}

        {/* Pagination Component */}
        <MuiPagination
          shape='rounded'
          color='primary'
          variant='tonal'
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          showFirstButton
          showLastButton
          disabled={totalPages <= 1}
        />
      </Box>
    </Box>
  )
}

export default Pagination
