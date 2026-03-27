'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { SystemMode } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { authService } from '@/services/auth.service'

// Styled Components
const ResetIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 550,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
}))

const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 355,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1,
})

const ResetPassword = ({ mode }: { mode: SystemMode }) => {
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const isValid = !!token && !!email

  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-forgot-password-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-forgot-password-light.png'
  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const characterIllustration = useImageVariant(mode, lightIllustration, darkIllustration)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !email || !password || password !== passwordConfirmation) return
    if (password.length < 8) return
    setLoading(true)
    try {
      await authService.resetPassword({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      })
      setSuccess(true)
      setTimeout(() => router.push(getLocalizedUrl('/login', locale as Locale)), 2000)
    } finally {
      setLoading(false)
    }
  }

  if (!isValid) {
    return (
      <div className='flex bs-full justify-center items-center p-6'>
        <div className='text-center'>
          <Typography variant='h5' color='error'>Lien invalide ou expiré</Typography>
          <Typography sx={{ mt: 2 }}>Le lien de réinitialisation est invalide ou a expiré.</Typography>
          <Button component={Link} href={getLocalizedUrl('/forgot-password', locale as Locale)} sx={{ mt: 3 }}>
            Demander un nouveau lien
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          { 'border-ie': settings.skin === 'bordered' }
        )}
      >
        <ResetIllustration src={characterIllustration} alt='illustration' />
        {!hidden && <MaskImg alt='mask' src={authBackground} />}
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link
          href={getLocalizedUrl('/login', locale as Locale)}
          className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'
        >
          <Logo />
        </Link>
        <div className='flex flex-col gap-6 is-full sm:max-is-[400px] mbs-8 sm:mbs-11 md:mbs-0'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>Nouveau mot de passe</Typography>
            <Typography>
              {success ? 'Mot de passe réinitialisé. Redirection...' : 'Définissez votre nouveau mot de passe.'}
            </Typography>
          </div>
          {!success && (
            <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-6'>
              <CustomTextField
                fullWidth
                type='password'
                label='Nouveau mot de passe'
                placeholder='Min. 8 caractères'
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <CustomTextField
                fullWidth
                type='password'
                label='Confirmation'
                placeholder='Répétez le mot de passe'
                value={passwordConfirmation}
                onChange={e => setPasswordConfirmation(e.target.value)}
                required
                error={!!passwordConfirmation && password !== passwordConfirmation}
                helperText={passwordConfirmation && password !== passwordConfirmation ? 'Les mots de passe ne correspondent pas' : ''}
              />
              <Button fullWidth variant='contained' type='submit' disabled={loading || password.length < 8 || password !== passwordConfirmation}>
                {loading ? 'Enregistrement...' : 'Réinitialiser'}
              </Button>
            </form>
          )}
          <Typography className='flex justify-center items-center' color='primary.main'>
            <Link href={getLocalizedUrl('/login', locale as Locale)} className='flex items-center gap-1.5'>
              <DirectionalIcon ltrIconClass='tabler-chevron-left' rtlIconClass='tabler-chevron-right' className='text-xl' />
              <span>Retour à la connexion</span>
            </Link>
          </Typography>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
