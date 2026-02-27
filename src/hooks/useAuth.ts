'use client'

// Third-party Imports
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// Service Imports
import { authService } from '@/services/auth.service'

// Redux Imports
import { setUser, setToken, clearAuth, setLoading } from '@/redux-store/slices/authSlice'
import type { RootState } from '@/redux-store'
import { setAuthToken, clearAuthToken } from '@/utils/auth.utils'

// Type Imports
import type { LoginRequest, AdminProfile } from '@/types/api.types'

export function useAuth() {
  const dispatch = useDispatch()
  const { user, token, isAuthenticated, loading } = useSelector((state: RootState) => state.auth)

  const login = useCallback(
    async (credentials: LoginRequest) => {
      dispatch(setLoading(true))
      try {
        const response = await authService.login(credentials)

        if (response?.data?.token && response?.data?.admin) {
          dispatch(setToken(response.data.token))
          dispatch(setUser(response.data.admin))
          setAuthToken(response.data.token)
        }
      } finally {
        dispatch(setLoading(false))
      }
    },
    [dispatch]
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // ignore logout API errors
    } finally {
      dispatch(clearAuth())
      clearAuthToken()
    }
  }, [dispatch])

  const refreshProfile = useCallback(async () => {
    const profile = await authService.getProfile()
    if (profile?.data) {
      dispatch(setUser(profile.data))
    }
  }, [dispatch])

  return {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    refreshProfile
  }
}
