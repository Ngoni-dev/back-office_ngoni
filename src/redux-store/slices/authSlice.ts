// Third-party Imports
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// Type Imports
import type { AdminProfile } from '@/types/api.types'

interface AuthState {
  user: AdminProfile | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  initialCheckDone: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  initialCheckDone: false
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AdminProfile | null>) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload
    },
    clearAuth: state => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setInitialCheckDone: (state, action: PayloadAction<boolean>) => {
      state.initialCheckDone = action.payload
    }
  }
})

export const { setUser, setToken, clearAuth, setLoading, setInitialCheckDone } = authSlice.actions
export default authSlice.reducer
