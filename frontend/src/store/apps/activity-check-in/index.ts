import { createWithEqualityFn } from 'zustand/traditional';

// ** Config
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';

interface UserState {
  activityCheckIn: any;
  activityCheckInLoading: boolean;
  activityCheckInErrors: boolean;
  getActivityCheckIn: (param: any) => any;
  addActivityCheckIn: (data: any) => any;
  updateActivityCheckIn: (data: string) => any;
  findDailyReport: (param: any) => any;
  findSummaryReport: (param: any) => any;
  removeActivityCheckIn: (id: string) => any;
  findDailyReportAdmin: (param: any) => any;
}

export const useActivityCheckInStore = createWithEqualityFn<UserState>()((set) => ({
  activityCheckIn: null,
  activityCheckInLoading: false,
  activityCheckInErrors: false,
  getActivityCheckIn: async (param: any) => {
    try {
      const { data } = await httpClient.get(
        `${authConfig.activityCheckInEndpoint}/teacher/${param.teacher}/classroom/${param.classroom}`,
      );
      return await data;
    } catch (err) {
      return err;
    }
  },
  addActivityCheckIn: async (data: any) => {
    set({ activityCheckInLoading: true });
    try {
      const response = await httpClient.post(authConfig.activityCheckInEndpoint as string, data);
      set({ activityCheckIn: await response.data });
    } catch (err) {
      set({ activityCheckInLoading: false, activityCheckInErrors: true });
    }
  },
  updateActivityCheckIn: async (data: any) => {
    set({ activityCheckInLoading: true });
    try {
      const response = await httpClient.patch(`${authConfig.activityCheckInEndpoint}/${data.id}/daily-report`, data);
      return await response.data;
    } catch (err) {
      return err;
    }
  },
  findDailyReport: async (param: any) => {
    try {
      const { data } = await httpClient.get(
        `${authConfig.activityCheckInEndpoint}/teacher/${param.teacherId}/classroom/${param.classroomId}/start-date/${param.startDate}/daily-report`,
      );
      return await data;
    } catch (err) {
      return err;
    }
  },
  findSummaryReport: async (param: any) => {
    try {
      const { data } = await httpClient.get(
        `${authConfig.activityCheckInEndpoint}/teacher/${param.teacherId}/classroom/${param.classroomId}/summary-report`,
      );
      return await data;
    } catch (err) {
      return err;
    }
  },
  removeActivityCheckIn: async (id: string) => {
    try {
      const { data } = await httpClient.delete(`${authConfig.activityCheckInEndpoint}/${id}`);
      return await data;
    } catch (err) {
      return err;
    }
  },
  findDailyReportAdmin: async (param: any) => {
    try {
      const { data } = await httpClient.get(
        `${authConfig.activityCheckInEndpoint}/start-date/${param.startDate}/end-date/${param.endDate}/admin-daily-report`,
      );
      return await data;
    } catch (err) {
      return err;
    }
  },
}));
