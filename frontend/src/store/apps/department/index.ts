import { createWithEqualityFn } from 'zustand/traditional';

// ** Config
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';

interface DepartmentState {
  department: any;
  fetchDepartment: (_token?: string) => Promise<any>;
}

export const useDepartmentStore = createWithEqualityFn<DepartmentState>()(() => ({
  department: null,
  fetchDepartment: async (_token?: string) => {
    try {
      const { data } = await httpClient.get(`${authConfig.departmentEndpoint}/`);
      return data;
    } catch (err) {
      return err;
    }
  },
}));
