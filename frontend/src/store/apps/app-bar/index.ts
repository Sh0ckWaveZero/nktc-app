import { createWithEqualityFn } from 'zustand/traditional';
import { devtools, persist } from 'zustand/middleware';

// ** Config
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';

export const useAppbarStore = createWithEqualityFn<any>()(
  devtools(
    persist(
      (set) => ({
        appbar: [],
        fetchAppbar: async (params: string, token: string) => {
          try {
            const response = await httpClient.get(authConfig.appbarEndpoint as string, {
              params: { q: params }
            });

            if (response?.data) {
              set({ appbar: response.data });
            } else {
              set({ appbar: [] });
            }
          } catch (error) {
            console.error('Error fetching appbar data:', error);
            set({ appbar: [] });
          }
        },
      }),
      {
        name: 'appbar-store',
      })));
