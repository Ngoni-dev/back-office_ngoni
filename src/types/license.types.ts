/**
 * License types - ngoni_admin_api_dev MusicLicense model & MusicLicenseResource
 * API returns snake_case; we use camelCase in app and normalize in service.
 */

export interface RegionRestriction {
  id: number
  music_license_id: number
  country_id: number
  country_name?: string | null
  restriction_type: string | null
}

export interface MusicLicense {
  id: number
  music_id: number
  owner_name: string
  license_type: string
  start_date: string
  end_date: string | null
  monetizable: boolean
  is_active?: boolean
  is_expired?: boolean
  /** From API when loaded */
  music?: { id: number; title: string | null } | null
  region_restrictions?: RegionRestriction[]
  regionRestrictions?: RegionRestriction[]
  created_at?: string
  updated_at?: string
}

export interface LicenseListResponse {
  status: 'success'
  data: MusicLicense[]
  meta?: { current_page: number; last_page: number; per_page: number; total: number }
}

export interface LicenseCreateRequest {
  music_id: number
  owner_name: string
  license_type: string
  start_date: string
  end_date?: string | null
  monetizable?: boolean
}

export interface LicenseUpdateRequest {
  owner_name?: string
  license_type?: string
  start_date?: string
  end_date?: string | null
  monetizable?: boolean
}

export interface AddRestrictionRequest {
  country_id: number
  restriction_type?: string | null
}
