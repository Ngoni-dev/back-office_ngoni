/**
 * Music types - matches ngoni_admin_api_dev MusicResource
 */

export type MusicStatus = 'pending' | 'approved' | 'rejected' | 'blocked'

export interface MusicArtist {
  id: number
  name: string
  bio?: string
  profile_image_url?: string
  verified: boolean
  role?: string
}

export interface MusicGenre {
  id: number
  name: string
  description?: string
}

export interface MusicLicense {
  id: number
  name?: string
  regionRestrictions?: unknown[]
}

export interface Music {
  id: number
  title: string
  duration: number
  duration_formatted?: string
  file_url?: string
  preview_url?: string
  upload_date?: string
  likes_count?: number
  usage_count?: number
  is_original?: boolean
  bitrate?: number
  country_id?: number
  language?: string
  status: MusicStatus
  approved_at?: string
  country?: { id: number; name: string }
  uploader?: { id: number; name: string; email: string }
  reviewer?: { id: number; name: string; email: string } | null
  artists?: MusicArtist[]
  genres?: MusicGenre[]
  licenses?: MusicLicense[]
  created_at?: string
  updated_at?: string
}

export interface MusicSearchParams {
  title?: string
  artist?: string
  artist_id?: number
  genre?: string
  status?: MusicStatus
  country_id?: number
  language?: string
  is_original?: boolean
  per_page?: number
  page?: number
}

export interface MusicListResponse {
  status?: 'success'
  data: Music[]
  pagination?: { current_page: number; per_page: number; total: number; last_page: number }
  meta?: { current_page: number; per_page: number; total: number; last_page: number }
}

export interface MusicCreateRequest {
  title: string
  audio_file: File
  country_id?: number
  language?: string
  is_original?: boolean
  artist_ids?: number[]
  genre_ids?: number[]
}

export interface MusicUpdateRequest {
  title?: string
  country_id?: number
  language?: string
  is_original?: boolean
  artist_ids?: number[]
  genre_ids?: number[]
}
