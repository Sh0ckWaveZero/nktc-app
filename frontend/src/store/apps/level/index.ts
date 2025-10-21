import { createWithEqualityFn } from 'zustand/traditional';

// ** Config
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';

interface UserState {
  fetchLevels: (token: string) => any;
}

export const useLevelStore = createWithEqualityFn<UserState>()(() => ({
  fetchLevels: async (token: string) => {
    try {
      const { data } = await httpClient.get(`${authConfig.levelEndpoint}/`);
      return await data;
    } catch (err) {
      return err;
    }
  },
}));
