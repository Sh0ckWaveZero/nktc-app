import { createWithEqualityFn } from 'zustand/traditional';
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';

interface StatisticsState {
  termStatistics: any;
  statisticsLoading: boolean;
  hasStatisticsErrors: boolean;
  getTermStatistics: (
    token: string,
    params: {
      startDate: string;
      endDate: string;
      academicYear?: string;
      departmentId?: string;
      programId?: string;
    },
  ) => any;
}

export const useStatisticsStore = createWithEqualityFn<StatisticsState>()((set) => ({
  termStatistics: null,
  statisticsLoading: false,
  hasStatisticsErrors: false,
  getTermStatistics: async (
    token: string,
    params: {
      startDate: string;
      endDate: string;
      academicYear?: string;
      departmentId?: string;
      programId?: string;
    },
  ) => {
    set({ statisticsLoading: true });
    try {
      const queryParams = new URLSearchParams({
        startDate: params.startDate,
        endDate: params.endDate,
        ...(params.academicYear && { academicYear: params.academicYear }),
        ...(params.departmentId && { departmentId: params.departmentId }),
        ...(params.programId && { programId: params.programId }),
      });

      const { data } = await httpClient.get(
        `${authConfig.statisticsEndpoint}/term?${queryParams.toString()}`,
      );

      set({ termStatistics: data, statisticsLoading: false });
      return data;
    } catch (err) {
      set({ statisticsLoading: false, hasStatisticsErrors: true });
      return err;
    }
  },
}));
