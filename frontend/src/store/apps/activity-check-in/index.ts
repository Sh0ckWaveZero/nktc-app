import { createWithEqualityFn } from 'zustand/traditional';

// ** Config
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';
interface UserState {
  activityCheckIn: any;
  activityCheckInLoading: boolean;
  activityCheckInErrors: boolean;
  getActivityCheckIn: (token: string, param: any) => any;
  addActivityCheckIn: (token: string, data: any) => any;
  updateActivityCheckIn: (token: string, data: string) => any;
  findDailyReport: (token: string, param: any) => any;
  findSummaryReport: (token: string, param: any) => any;
  removeActivityCheckIn: (token: string, id: string) => any;
  findDailyReportAdmin: (token: string, param: any) => any;
}

export const useActivityCheckInStore = createWithEqualityFn<UserState>()((set) => ({
  activityCheckIn: null,
  activityCheckInLoading: false,
  activityCheckInErrors: false,
  getActivityCheckIn: async (token: string, param: any) => {
    try {
      const { data } = await httpClient.get(
        `${authConfig.activityCheckInEndpoint}/teacher/${param.teacher}/classroom/${param.classroom}`,
      );
      return await data;
    } catch (err) {
      return err;
    }
  },
  addActivityCheckIn: async (token: string, data: any) => {
    set({ activityCheckInLoading: true });
    try {
      const response = await httpClient.post(authConfig.activityCheckInEndpoint as string, data);
      set({ activityCheckIn: await response.data });
    } catch (err) {
      set({ activityCheckInLoading: false, activityCheckInErrors: true });
    }
  },
  updateActivityCheckIn: async (token: string, data: any) => {
    set({ activityCheckInLoading: true });
    try {
      const response = await httpClient.patch(`${authConfig.activityCheckInEndpoint}/${data.id}/daily-report`, data);
      return await response.data;
    } catch (err) {
      return err;
    }
  },
  findDailyReport: async (token: string, param: any) => {
    try {
      const { data } = await httpClient.get(
        `${authConfig.activityCheckInEndpoint}/teacher/${param.teacherId}/classroom/${param.classroomId}/start-date/${param.startDate}/daily-report`,
      );
      return await data;
    } catch (err) {
      return err;
    }
  },
  findSummaryReport: async (token: string, param: any) => {
    try {
      const { data } = await httpClient.get(
        `${authConfig.activityCheckInEndpoint}/teacher/${param.teacherId}/classroom/${param.classroomId}/summary-report`,
      );
      return await data;
    } catch (err) {
      return err;
    }
  },
  removeActivityCheckIn: async (token: string, id: string) => {
    try {
      const { data } = await httpClient.delete(`${authConfig.activityCheckInEndpoint}/${id}`);
      return await data;
    } catch (err) {
      return err;
    }
  },
  findDailyReportAdmin: async (token: string, param: any) => {
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
