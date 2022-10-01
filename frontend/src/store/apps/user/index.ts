import axios from 'axios';
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// ** Config
import authConfig from '@/configs/auth';
import { LoginParams } from '@/context/types';


export const useUserStore = create<any>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: '',
        loading: false,
        hasErrors: false,
        login: async (param: LoginParams) => {
          set({ loading: true });
          try {
            await axios.post(authConfig.loginEndpoint, param).then(async (response: any) => {
              const { data, token } = await response.data;
              set({ user: data, loading: false, hasErrors: false, token: token });
            });
          } catch (err) {
            set({ loading: false, hasErrors: true });
          }
        },
        logout: () => {
          set({ user: null, token: '' });
        },
        getMe: async (token: string) => {
          set({ loading: true });
          try {
            const { data } = await axios.get(authConfig.meEndpoint, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            set({ user: data, loading: false, hasErrors: false });
          } catch (err) {
            set({ user: null, token: '', loading: false, hasErrors: true });
          }
        },
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