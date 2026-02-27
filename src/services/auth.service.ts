/**
 * Auth service - communicates with ngoni_admin_api_dev
 */

import { apiClient } from './api/client'
import type {
  LoginRequest,
  LoginResponse,
  ProfileResponse,
  RefreshResponse
} from '@/types/api.types'

export class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/admin/auth/login', credentials)
  }

  async logout(): Promise<void> {
    return apiClient.post<void>('/admin/auth/logout')
  }

  async refreshToken(): Promise<RefreshResponse> {
    return apiClient.post<RefreshResponse>('/admin/auth/refresh')
  }

  async getProfile(): Promise<ProfileResponse> {
    return apiClient.get<ProfileResponse>('/admin/auth/profile')
  }
}

export const authService = new AuthService()
