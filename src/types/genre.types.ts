/**
 * Genre types - matches ngoni_admin_api_dev GenreResource
 */

export interface Genre {
  id: number
  name: string
  description?: string
  musics?: { id: number; title: string }[]
  created_at?: string
  updated_at?: string
}

export interface GenreListResponse {
  status: 'success'
  data: Genre[]
  meta?: { current_page: number; last_page: number; per_page: number; total: number }
  pagination?: { current_page: number; last_page: number; per_page: number; total: number }
}

export interface GenreCreateRequest {
  name: string
  description?: string
}

export interface GenreUpdateRequest {
  name?: string
  description?: string
}

export interface AttachGenreRequest {
  music_id: number
  genre_id: number
}
