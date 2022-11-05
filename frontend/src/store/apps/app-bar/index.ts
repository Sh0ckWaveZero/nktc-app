import axios from 'axios';
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// ** Config
import { authConfig } from '@/configs/auth';
import shallow from 'zustand/shallow';

export const useAppbarStore = create<any>()(
  devtools(
    persist((set) => ({
      appbar: [],
      fetchAppbar: async (params: string, token: string) => {
        const response = await axios.get(authConfig.appbarEndpoint as string, {
          params: { q: params },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        set({ appbar: await response.data });
      },
      shallow,
    })),
    {
      name: 'appbar-store',
    },
  ),
);