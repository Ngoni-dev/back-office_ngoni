'use client'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { SystemMode } from '@core/types'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

// Styled Components
const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 355,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const NotFound = ({ mode, lang = 'en' }: { mode: SystemMode; lang?: string }) => {
  // Vars
  const darkImg = '/images/pages/misc-mask-dark.png'
  const lightImg = '/images/pages/misc-mask-light.png'

  // Hooks
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const miscBackground = useImageVariant(mode, lightImg, darkImg)

  return (
    <Box
      className='flex items-center justify-center min-bs-[100dvh] relative p-6 overflow-x-hidden'
      sx={{ backgroundColor: 'background.default' }}
    >
      <div className='flex items-center flex-col text-center'>
        <div className='flex flex-col gap-2 is-[90vw] sm:is-[unset] mbe-6'>
          <Typography className='font-medium text-8xl' color='text.primary'>
            404
          </Typography>
          <Typography variant='h4' color='text.primary'>
            Page introuvable ⚠️
          </Typography>
          <Typography color='text.secondary'>
            Nous n&#39;avons pas trouvé la page que vous recherchez.
          </Typography>
        </div>
        <img
          alt='error-404-illustration'
          src='/images/illustrations/characters/1.png'
          className='object-contain bs-[300px] md:bs-[350px] lg:bs-[400px] mbe-6'
        />
        <Button href={`/${lang}`} component={Link} variant='contained'>
          Retour à l&#39;accueil
        </Button>
      </div>
      {!hidden && (
        <MaskImg
          alt='mask'
          src={miscBackground}
          className={classnames({ 'scale-x-[-1]': theme.direction === 'rtl' })}
        />
      )}
    </Box>
  )
}

export default NotFound
