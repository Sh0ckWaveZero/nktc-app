import { createWithEqualityFn } from 'zustand/traditional';;

// ** Config
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';

interface UserState {
  fetchProgram: (token: string) => any;
}

export const useProgramStore = createWithEqualityFn<UserState>()(
  () => ({
    department: null,
    fetchProgram: async (token: string) => {
      try {
        const { data } = await httpClient.get(
          `${authConfig.programEndpoint}/`,
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