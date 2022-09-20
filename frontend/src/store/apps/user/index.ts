import axios from 'axios';
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// ** Config
import authConfig from '@/configs/auth';


export const useUserStore = create<any>()(
  devtools(
    persist(
      (set) => ({
        user: [],
        addUser: async (data: any) => {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
            data,
          });
          set({ user: await response.data });
        },
        deleteUser: async (id: number | string) => {
          const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`);
          set({ user: await response.data });
        },
      }),
      {
        name: 'user-storage',
      },
    ),
  ),
);