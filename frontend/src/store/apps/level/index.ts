import { create } from 'zustand';

// ** Config
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';

interface UserState {
  fetchLevels: (token: string) => any;
}

export const useLevelStore = create<UserState>()(
  () => ({
    fetchLevels: async (token: string) => {
      try {
        const { data } = await httpClient.get(
          `${authConfig.levelEndpoint}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        return await data;
      } catch (err) {
        return err;
      }
    },
  }),
);