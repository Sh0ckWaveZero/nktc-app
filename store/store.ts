import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import usersReduce from './slices/userSlice';


const reducer = {
  user: usersReduce
}

export const store = configureStore({
  reducer, devTools: process.env.NODE_ENV !== 'production'
})

// export type of root state from reducers
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
