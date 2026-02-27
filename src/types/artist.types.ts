/**
 * Artist types - matches ngoni_admin_api_dev ArtistResource
 */

export interface Artist {
  id: number
  name: string
  bio?: string
  profile_image_url?: string
  verified: boolean
  musics?: { id: number; title: string; role?: string }[]
  created_at?: string
  updated_at?: string
}

export interface ArtistListResponse {
  status: 'success'
  data: Artist[]
  meta?: { current_page: number; last_page: number; per_page: number; total: number }
}

export interface ArtistCreateRequest {
  name: string
  bio?: string
  profile_image?: File
  profile_image_url?: File
}

export interface ArtistUpdateRequest {
  name?: string
  bio?: string
  profile_image?: File
  profile_image_url?: File
}

export interface AttachArtistRequest {
  music_id: number
  artist_id: number
  role?: string
}
