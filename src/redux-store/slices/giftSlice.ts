// Third-party Imports
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

// Type Imports
import type { GiftProduct, GiftProductListResponse } from '@/types/gift.types'

interface GiftState {
  giftProducts: GiftProduct[]
  pagination: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  } | null
  loading: boolean
  error: string | null
}

const initialState: GiftState = {
  giftProducts: [],
  pagination: null,
  loading: false,
  error: null
}

export const giftSlice = createSlice({
  name: 'gift',
  initialState,
  reducers: {
    setGiftProducts: (state, action: PayloadAction<GiftProductListResponse>) => {
      state.giftProducts = action.payload.data
      state.pagination = action.payload.meta || null
      state.loading = false
      state.error = null
    },
    addGiftProduct: (state, action: PayloadAction<GiftProduct>) => {
      state.giftProducts.unshift(action.payload)
      if (state.pagination) {
        state.pagination.total += 1
      }
    },
    updateGiftProduct: (state, action: PayloadAction<GiftProduct>) => {
      const index = state.giftProducts.findIndex(gift => gift.id === action.payload.id)
      if (index !== -1) {
        state.giftProducts[index] = action.payload
      }
    },
    removeGiftProduct: (state, action: PayloadAction<number>) => {
      state.giftProducts = state.giftProducts.filter(gift => gift.id !== action.payload)
      if (state.pagination) {
        state.pagination.total -= 1
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    clearError: state => {
      state.error = null
    }
  }
})

export const {
  setGiftProducts,
  addGiftProduct,
  updateGiftProduct,
  removeGiftProduct,
  setLoading,
  setError,
  clearError
} = giftSlice.actions
export default giftSlice.reducer
