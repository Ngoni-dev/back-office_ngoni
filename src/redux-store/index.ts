// Third-party Imports
import { configureStore } from '@reduxjs/toolkit'

// Slice Imports
import artistReducer from '@/redux-store/slices/artistSlice'
import authReducer from '@/redux-store/slices/authSlice'
import genreReducer from '@/redux-store/slices/genreSlice'
import giftReducer from '@/redux-store/slices/giftSlice'
import licenseReducer from '@/redux-store/slices/licenseSlice'
import musicReducer from '@/redux-store/slices/musicSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    music: musicReducer,
    artist: artistReducer,
    genre: genreReducer,
    license: licenseReducer,
    gift: giftReducer
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false })
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
