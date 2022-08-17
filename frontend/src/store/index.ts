// ** Toolkit imports
import { configureStore } from '@reduxjs/toolkit'

// ** Reducers

import teacher from '../store/apps/teacher'

export const store = configureStore({
  reducer: {
    teacher: teacher,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>