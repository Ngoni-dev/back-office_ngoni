'use client'

// React Imports
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'

// MUI Imports
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@/configs/i18n'
import type { RootState } from '@/redux-store'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const GuestOnlyRoute = ({ children, lang }: ChildrenType & { lang: Locale }) => {
  const router = useRouter()
  const { isAuthenticated, initialCheckDone } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (initialCheckDone && isAuthenticated) {
      router.replace(getLocalizedUrl(themeConfig.homePageUrl, lang))
    }
  }, [initialCheckDone, isAuthenticated, router, lang])

  if (!initialCheckDone) {
    return (
      <Box className='flex items-center justify-center min-bs-[50vh]'>
        <CircularProgress />
      </Box>
    )
  }

  if (isAuthenticated) {
    return (
      <Box className='flex items-center justify-center min-bs-[50vh]'>
        <CircularProgress />
      </Box>
    )
  }

  return <>{children}</>
}

export default GuestOnlyRoute
