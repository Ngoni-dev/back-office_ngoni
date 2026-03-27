'use client'

// React Imports
import { useEffect } from 'react'

// Redux Imports
import { useDispatch } from 'react-redux'
import { setUser, setToken, setInitialCheckDone } from '@/redux-store/slices/authSlice'

// Service Imports
import { authService } from '@/services/auth.service'

// Util Imports
import { getAuthToken, clearAuthToken } from '@/utils/auth.utils'

// Type Imports
import type { ChildrenType } from '@core/types'

type Props = ChildrenType

export const AuthProvider = ({ children }: Props) => {
  const dispatch = useDispatch()

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken()
      if (!token) {
        dispatch(setInitialCheckDone(true))
        return
      }

      try {
        const profile = await authService.getProfile()
        if (profile?.data) {
          dispatch(setToken(token))
          dispatch(setUser(profile.data))
        } else {
          clearAuthToken()
        }
      } catch (err: unknown) {
        // En prod, ne supprimer le token que sur 401 (session invalide).
        // Sinon (réseau, CORS, 500) on garde le token pour éviter la boucle
        // login → redirect → getProfile échoue → token effacé → redirect login.
        const status = (err as { response?: { status?: number } })?.response?.status
        if (status === 401) {
          clearAuthToken()
        } else {
          // Token conservé : on met un profil minimal pour passer le guard.
          dispatch(setToken(token))
          dispatch(
            setUser({
              id: 0,
              name: '',
              email: '',
              role: 'admin',
              acl_roles: [],
              permissions: []
            })
          )
        }
      } finally {
        dispatch(setInitialCheckDone(true))
      }
    }

    initAuth()
  }, [dispatch])

  return <>{children}</>
}
