/**
 * useLicense Hook
 * Custom hook for managing license operations with Redux state
 */

import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'

// Service Imports
import { licenseService } from '@/services/license.service'

// Redux Actions
import {
    setError,
    setLicenses,
    setLoading
} from '@/redux-store/slices/licenseSlice'

// Type Imports
import type { RootState } from '@/redux-store'

export function useLicense() {
  const dispatch = useDispatch()
  const { licenses, loading, error } = useSelector((state: RootState) => state.license)

  /**
   * Fetch list of licenses
   */
  const fetchLicenses = async (page = 1, perPage = 50) => {
    try {
      dispatch(setLoading(true))
      const response = await licenseService.list(page, perPage)
      dispatch(setLicenses(response))
      toast.success('Licenses loaded successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch licenses'
      dispatch(setError(errorMessage))
      toast.error(errorMessage)
      throw err
    }
  }

  /**
   * Add a restriction to a license
   */
  const addRestriction = async (
    licenseId: number,
    data: { country_id: number; restriction_type: string }
  ) => {
    try {
      dispatch(setLoading(true))
      await licenseService.addRestriction(licenseId, data)
      toast.success('Restriction added successfully')
      // Optionally refetch the license to get updated data
      await fetchLicenses()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add restriction'
      dispatch(setError(errorMessage))
      toast.error(errorMessage)
      throw err
    }
  }

  /**
   * Remove a restriction from a license
   */
  const removeRestriction = async (licenseId: number, restrictionId: number) => {
    try {
      dispatch(setLoading(true))
      await licenseService.removeRestriction(licenseId, restrictionId)
      toast.success('Restriction removed successfully')
      // Optionally refetch the license to get updated data
      await fetchLicenses()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove restriction'
      dispatch(setError(errorMessage))
      toast.error(errorMessage)
      throw err
    }
  }

  return {
    // State
    licenses,
    loading,
    error,

    // Actions
    fetchLicenses,
    addRestriction,
    removeRestriction
  }
}
