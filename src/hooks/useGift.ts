/**
 * useGift Hook
 * Custom hook for managing gift product operations with Redux state
 */

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'

// Service Imports
import { giftProductService } from '@/services/gift.service'

// Redux Actions
import {
    addGiftProduct,
    removeGiftProduct,
    setError,
    setGiftProducts,
    setLoading,
    updateGiftProduct as updateGiftProductAction
} from '@/redux-store/slices/giftSlice'

// Type Imports
import type { RootState } from '@/redux-store'
import type { GiftProductCreateRequest, GiftProductUpdateRequest } from '@/types/gift.types'

export function useGift() {
  const dispatch = useDispatch()
  const { giftProducts, pagination, loading, error } = useSelector((state: RootState) => state.gift)
  const [uploading, setUploading] = useState(false)

  /**
   * Fetch paginated list of gift products
   */
  const fetchGiftProducts = async (
    page = 1,
    perPage = 15,
    filters?: { category?: string; is_active?: boolean }
  ) => {
    try {
      dispatch(setLoading(true))
      const response = await giftProductService.list(page, perPage, filters)
      dispatch(setGiftProducts(response))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch gift products'
      dispatch(setError(errorMessage))
      toast.error(errorMessage)
      throw err
    }
  }

  /**
   * Create a new gift product with file uploads (image and animation)
   */
  const createGiftProduct = async (data: GiftProductCreateRequest) => {
    setUploading(true)
    try {
      dispatch(setLoading(true))
      const response = await giftProductService.create(data)
      dispatch(addGiftProduct(response.data))
      toast.success('Gift product created successfully')
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create gift product'
      dispatch(setError(errorMessage))
      toast.error(errorMessage)
      throw err
    } finally {
      setUploading(false)
    }
  }

  /**
   * Update an existing gift product
   */
  const updateGiftProduct = async (id: number, data: GiftProductUpdateRequest) => {
    try {
      dispatch(setLoading(true))
      const response = await giftProductService.update(id, data)
      dispatch(updateGiftProductAction(response.data))
      toast.success('Gift product updated successfully')
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update gift product'
      dispatch(setError(errorMessage))
      toast.error(errorMessage)
      throw err
    }
  }

  /**
   * Delete a gift product
   */
  const deleteGiftProduct = async (id: number) => {
    try {
      dispatch(setLoading(true))
      await giftProductService.delete(id)
      dispatch(removeGiftProduct(id))
      toast.success('Gift product deleted successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete gift product'
      dispatch(setError(errorMessage))
      toast.error(errorMessage)
      throw err
    }
  }

  /**
   * Toggle active/inactive status of a gift product
   */
  const toggleActive = async (id: number) => {
    try {
      dispatch(setLoading(true))
      const response = await giftProductService.toggleActive(id)
      dispatch(updateGiftProductAction(response.data))
      toast.success(
        `Gift product ${response.data.is_active ? 'activated' : 'deactivated'} successfully`
      )
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle gift product status'
      dispatch(setError(errorMessage))
      toast.error(errorMessage)
      throw err
    }
  }

  return {
    // State
    giftProducts,
    pagination,
    loading,
    error,
    uploading,

    // Actions
    fetchGiftProducts,
    createGiftProduct,
    updateGiftProduct,
    deleteGiftProduct,
    toggleActive
  }
}
