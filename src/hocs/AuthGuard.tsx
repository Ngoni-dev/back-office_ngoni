'use client'

// React Imports
import { useSelector } from 'react-redux'

// Type Imports
import type { Locale } from '@/configs/i18n'
import type { ChildrenType } from '@core/types'
import type { RootState } from '@/redux-store'

// Component Imports
import AuthRedirect from '@/components/AuthRedirect'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

export default function AuthGuard({ children, locale }: ChildrenType & { locale: Locale }) {
  const { isAuthenticated, initialCheckDone } = useSelector((state: RootState) => state.auth)

  if (!initialCheckDone) {
    return (
      <Box className='flex items-center justify-center min-bs-[50vh]'>
        <CircularProgress />
      </Box>
    )
  }

  return <>{isAuthenticated ? children : <AuthRedirect lang={locale} />}</>
}
