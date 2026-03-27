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

  async forgotPassword(email: string): Promise<{ status: string; message: string }> {
    return apiClient.post<{ status: string; message: string }>('/admin/auth/forgot-password', { email })
  }

  async resetPassword(data: { email: string; token: string; password: string; password_confirmation: string }): Promise<{ status: string; message: string }> {
    return apiClient.post<{ status: string; message: string }>('/admin/auth/reset-password', data)
  }
}

export const authService = new AuthService()
