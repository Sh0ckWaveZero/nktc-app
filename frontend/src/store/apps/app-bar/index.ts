import axios from 'axios';
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// ** Config
import authConfig from '@/configs/auth';

export const useAppbarStore = create<any>()(
  devtools(
    persist((set) => ({
      appbar: [],
      fetchAppbar: async (params: string, token: string) => {
        const response = await axios.get(authConfig.appbarEndpoint, {
          params: { q: params },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        set({ appbar: await response.data });
      },
    })),
    {
      name: 'appbar-store',
    },
  ),
);