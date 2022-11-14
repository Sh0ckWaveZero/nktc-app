import create from 'zustand';

// ** Config
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';

interface UserState {
  department: any;
  fetchDepartment: (token: string) => any;
}

export const useDepartmentStore = create<UserState>()(
  () => ({
    department: null,
    fetchDepartment: async (token: string) => {
      try {
        const { data } = await httpClient.get(
          `${authConfig.departmentEndpoint}/`,
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