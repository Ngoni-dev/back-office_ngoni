/**
 * API interceptors - auth token, error handling, token refresh
 */

import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { getAuthToken, setAuthToken, clearAuthToken } from '@/utils/auth.utils'
import { toast } from 'react-toastify'

const baseURL =
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
    : ''

async function refreshAuthToken(): Promise<string> {
  const token = getAuthToken()
  if (!token) throw new Error('Token refresh failed')

  const response = await fetch(`${baseURL}/admin/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('Token refresh failed')
  }

  const json = await response.json()
  const newToken = json?.data?.token
  if (!newToken) throw new Error('Token refresh failed')
  return newToken
}

let lastNetworkToastAt = 0
const NETWORK_TOAST_COOLDOWN_MS = 10000

function handleApiError(error: AxiosError): void {
  const config = error.config as InternalAxiosRequestConfig & { skip404Toast?: boolean; suppressErrorToast?: boolean }
  if (config?.suppressErrorToast) return

  if (!error.response) {
    const now = Date.now()
    if (now - lastNetworkToastAt > NETWORK_TOAST_COOLDOWN_MS) {
      lastNetworkToastAt = now
      toast.error('Erreur réseau. Vérifiez votre connexion.')
    }
    return
  }

  const status = error.response.status
  const data = error.response.data as { message?: string; errors?: Record<string, string[]> }

  switch (status) {
    case 401:
      toast.error('Non autorisé. Veuillez vous reconnecter.')
      break
    case 403:
      toast.error("Vous n'avez pas la permission d'effectuer cette action.")
      break
    case 404:
      if (!config?.skip404Toast) {
        toast.error('Ressource introuvable.')
      }
      break
    case 422:
      if (data?.errors) {
        Object.values(data.errors).forEach((messages: string[]) => {
          messages.forEach((msg: string) => toast.error(msg))
        })
      } else {
        toast.error(data?.message || 'Erreur de validation.')
      }
      break
    case 500:
      toast.error('Erreur serveur. Veuillez réessayer plus tard.')
      break
    default:
      toast.error(data?.message || 'Une erreur est survenue.')
  }
}

export function setupInterceptors(instance: AxiosInstance): void {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAuthToken()
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    error => Promise.reject(error)
  )

  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

      if (error.response?.status === 401 && !originalRequest?._retry) {
        originalRequest._retry = true

        try {
          const token = await refreshAuthToken()
          setAuthToken(token)

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }

          return instance(originalRequest)
        } catch (refreshError) {
          clearAuthToken()
          if (typeof window !== 'undefined') {
            window.location.href = '/en/login'
          }
          return Promise.reject(refreshError)
        }
      }

      handleApiError(error)
      return Promise.reject(error)
    }
  )
}
