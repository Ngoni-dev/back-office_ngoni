/**
 * Gift Product types - matches ngoni_admin_api_dev GiftProductResource
 */

export interface GiftProduct {
  id: number
  name: string
  slug?: string
  description?: string
  price: number
  currency?: string
  image_url?: string
  animation_url?: string
  icon_name?: string
  color?: string
  category?: string
  is_active: boolean
  display_order?: number
  created_at?: string
  updated_at?: string
}

export interface GiftProductListResponse {
  status: 'success'
  data: GiftProduct[]
  meta?: { current_page: number; last_page: number; per_page: number; total: number }
}

export const GIFT_CATEGORIES = ['FLOWER', 'JEWELRY', 'SPECIAL', 'SEASONAL', 'OTHER'] as const
export type GiftCategory = (typeof GIFT_CATEGORIES)[number]

export interface GiftProductCreateRequest {
  name: string
  description?: string
  price: number
  category?: string
  image?: File
  animation?: File
}

export interface GiftProductUpdateRequest {
  name?: string
  description?: string
  price?: number
  category?: string
  image?: File
  animation?: File
}
