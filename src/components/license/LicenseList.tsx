'use client'

// React Imports
import { useEffect } from 'react'

// MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

// Component Imports

// Hook Imports
import { useLicense } from '@/hooks/useLicense'

// Type Imports
import type { MusicLicense } from '@/types/license.types'

interface LicenseListProps {
  onManageRestrictions?: (license: MusicLicense) => void
}

const LicenseList = ({ onManageRestrictions }: LicenseListProps) => {
  const { licenses, loading, error, fetchLicenses } = useLicense()

  // Load licenses on mount
  useEffect(() => {
    fetchLicenses(1, 50)
  }, [])

  return (
    <Box>
      {/* Error Alert */}
      {error && (
        <Alert severity='error' sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box display='flex' justifyContent='center' alignItems='center' minHeight={200}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty State */}
      {!loading && licenses.length === 0 && (
        <Card>
          <CardContent>
            <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' minHeight={200} gap={2}>
              <i className='tabler-license-off' style={{ fontSize: 48, opacity: 0.5 }} />
              <Typography variant='h6' color='text.secondary'>
                Aucune licence trouvée
              </Typography>
              <Typography variant='body2' color='text.disabled'>
                Les licences sont créées automatiquement lors de la création de musiques
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* License Table */}
      {!loading && licenses.length > 0 && (
        <Card>
          <CardHeader
            title='Licences musicales'
            subheader='Gérer les licences et leurs restrictions régionales'
          />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID Licence</TableCell>
                  <TableCell>ID Musique</TableCell>
                  <TableCell>Restrictions régionales</TableCell>
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {licenses.map((license: MusicLicense) => (
                  <TableRow key={license.id}>
                    <TableCell>
                      <Typography variant='body2' fontWeight={500}>
                        #{license.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {license.music_id ? (
                        <Chip
                          label={`Musique #${license.music_id}`}
                          size='small'
                          variant='tonal'
                          color='primary'
                        />
                      ) : (
                        <Typography variant='body2' color='text.disabled'>
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {license.regionRestrictions && license.regionRestrictions.length > 0 ? (
                        <Box display='flex' gap={1} flexWrap='wrap'>
                          {license.regionRestrictions.map((restriction) => (
                            <Chip
                              key={restriction.id}
                              label={`Pays #${restriction.country_id} (${restriction.restriction_type})`}
                              size='small'
                              variant='outlined'
                              color='warning'
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant='body2' color='text.disabled'>
                          Aucune restriction
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align='right'>
                      {onManageRestrictions && (
                        <Box display='flex' gap={1} justifyContent='flex-end'>
                          <Typography
                            variant='body2'
                            color='primary'
                            sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => onManageRestrictions(license)}
                          >
                            Gérer les restrictions
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  )
}

export default LicenseList
