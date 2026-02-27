// Third-party Imports
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

// Type Imports
import type { LicenseListResponse, MusicLicense } from '@/types/license.types'

interface LicenseState {
  licenses: MusicLicense[]
  loading: boolean
  error: string | null
}

const initialState: LicenseState = {
  licenses: [],
  loading: false,
  error: null
}

export const licenseSlice = createSlice({
  name: 'license',
  initialState,
  reducers: {
    setLicenses: (state, action: PayloadAction<LicenseListResponse>) => {
      state.licenses = action.payload.data
      state.loading = false
      state.error = null
    },
    addLicense: (state, action: PayloadAction<MusicLicense>) => {
      state.licenses.unshift(action.payload)
    },
    updateLicense: (state, action: PayloadAction<MusicLicense>) => {
      const index = state.licenses.findIndex(license => license.id === action.payload.id)
      if (index !== -1) {
        state.licenses[index] = action.payload
      }
    },
    removeLicense: (state, action: PayloadAction<number>) => {
      state.licenses = state.licenses.filter(license => license.id !== action.payload)
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

export const { setLicenses, addLicense, updateLicense, removeLicense, setLoading, setError, clearError } =
  licenseSlice.actions
export default licenseSlice.reducer
