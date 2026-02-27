/**
 * License service - ngoni_admin_api_dev (MusicLicense)
 * GET list, POST create, GET show, PUT update, DEL delete, POST add restriction, DEL remove restriction
 */

import { apiClient } from './api/client'
import type {
  MusicLicense,
  LicenseListResponse,
  LicenseCreateRequest,
  LicenseUpdateRequest,
  RegionRestriction
} from '@/types/license.types'

/** Normalize API response (snake_case) to camelCase for app */
function normalizeLicense(raw: Record<string, unknown>): MusicLicense {
  const restrictions = (raw.region_restrictions as RegionRestriction[] | undefined) ?? []
  return {
    id: raw.id as number,
    music_id: raw.music_id as number,
    owner_name: (raw.owner_name as string) ?? '',
    license_type: (raw.license_type as string) ?? '',
    start_date: (raw.start_date as string) ?? '',
    end_date: (raw.end_date as string) ?? null,
    monetizable: Boolean(raw.monetizable),
    is_active: raw.is_active as boolean | undefined,
    is_expired: raw.is_expired as boolean | undefined,
    music: raw.music as MusicLicense['music'],
    region_restrictions: restrictions,
    regionRestrictions: restrictions,
    created_at: raw.created_at as string | undefined,
    updated_at: raw.updated_at as string | undefined
  }
}

export class LicenseService {
  async list(page = 1, perPage = 15): Promise<LicenseListResponse> {
    const response = await apiClient.get<LicenseListResponse>(
      `/admin/licenses?page=${page}&per_page=${perPage}`
    )
    const r = response as unknown as LicenseListResponse
    if (r?.data && Array.isArray(r.data)) {
      r.data = (r.data as unknown as Record<string, unknown>[]).map(normalizeLicense) as MusicLicense[]
    }
    return r
  }

  async get(id: number): Promise<{ status: string; data: MusicLicense }> {
    const response = await apiClient.get<{ status: string; data: Record<string, unknown> }>(
      `/admin/licenses/${id}`
    )
    const data = response?.data
    if (data) {
      return { status: response.status, data: normalizeLicense(data) }
    }
    return response as unknown as { status: string; data: MusicLicense }
  }

  async create(data: LicenseCreateRequest): Promise<{ status: string; message?: string; data: MusicLicense }> {
    const payload = {
      music_id: data.music_id,
      owner_name: data.owner_name,
      license_type: data.license_type,
      start_date: data.start_date,
      end_date: data.end_date ?? null,
      monetizable: data.monetizable ?? false
    }
    const response = await apiClient.post<{
      status: string
      message?: string
      data: Record<string, unknown>
    }>('/admin/licenses', payload)
    if (response?.data) {
      return {
        status: response.status,
        message: response.message,
        data: normalizeLicense(response.data)
      }
    }
    return response as unknown as { status: string; data: MusicLicense }
  }

  async update(
    id: number,
    data: LicenseUpdateRequest
  ): Promise<{ status: string; message?: string; data: MusicLicense }> {
    const payload: Record<string, unknown> = {}
    if (data.owner_name !== undefined) payload.owner_name = data.owner_name
    if (data.license_type !== undefined) payload.license_type = data.license_type
    if (data.start_date !== undefined) payload.start_date = data.start_date
    if (data.end_date !== undefined) payload.end_date = data.end_date
    if (data.monetizable !== undefined) payload.monetizable = data.monetizable
    const response = await apiClient.put<{
      status: string
      message?: string
      data: Record<string, unknown>
    }>(`/admin/licenses/${id}`, payload)
    if (response?.data) {
      return {
        status: response.status,
        message: response.message,
        data: normalizeLicense(response.data)
      }
    }
    return response as unknown as { status: string; data: MusicLicense }
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/admin/licenses/${id}`)
  }

  async addRestriction(
    licenseId: number,
    data: { country_id: number; restriction_type?: string | null }
  ): Promise<{ status: string; data: { id: number; music_license_id: number; country_id: number; restriction_type: string | null } }> {
    return apiClient.post(`/admin/licenses/${licenseId}/restrictions`, {
      country_id: data.country_id,
      restriction_type: data.restriction_type ?? null
    })
  }

  async removeRestriction(licenseId: number, restrictionId: number): Promise<void> {
    await apiClient.delete(`/admin/licenses/${licenseId}/restrictions/${restrictionId}`)
  }
}

export const licenseService = new LicenseService()
