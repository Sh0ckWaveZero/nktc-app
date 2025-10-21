import { createWithEqualityFn } from 'zustand/traditional';

// ** Config
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';
interface UserState {
  reportCheckIn: any;
  reportCheckInLoading: boolean;
  hasReportCheckInErrors: boolean;
  getReportCheckIn: (token: string, param: any) => any;
  addReportCheckIn: (token: string, data: any) => any;
  updateReportCheckIn: (token: string, data: string) => any;
  findDailyReport: (token: string, param: any) => any;
  findSummaryReport: (token: string, param: any) => any;
  removeReportCheckIn: (token: string, id: string) => any;
  findDailyReportAdmin: (token: string, param: any) => any;
  findStudentWeeklyReport: (token: string, param: any) => any;
}

export const useReportCheckInStore = createWithEqualityFn<UserState>()((set) => ({
  reportCheckIn: null,
  reportCheckInLoading: false,
  hasReportCheckInErrors: false,
  getReportCheckIn: async (token: string, param: any) => {
    try {
      const { data } = await httpClient.get(
        `${authConfig.reportCheckInEndpoint}/teacher/${param.teacher}/classroom/${param.classroom}`,
      );
      return await data;
    } catch (err) {
      return err;
    }
  },
  addReportCheckIn: async (token: string, data: any) => {
    set({ reportCheckInLoading: true });
    try {
      const response = await httpClient.post(authConfig.reportCheckInEndpoint as string, data);
      set({ reportCheckIn: await response.data });
    } catch (err) {
      set({ reportCheckInLoading: false, hasReportCheckInErrors: true });
    }
  },
  updateReportCheckIn: async (token: string, data: any) => {
    set({ reportCheckInLoading: true });
    try {
      const response = await httpClient.patch(`${authConfig.reportCheckInEndpoint}/${data.id}/daily-report`, data);
      return await response.data;
    } catch (err) {
      return err;
    }
  },
  findDailyReport: async (token: string, param: any) => {
    try {
      const { data } = await httpClient.get(
        `${authConfig.reportCheckInEndpoint}/teacher/${param.teacherId}/classroom/${param.classroomId}/start-date/${param.startDate}/daily-report`,
      );
      return await data;
    } catch (err) {
      return err;
    }
  },
  findSummaryReport: async (token: string, param: any) => {
    try {
      const { data } = await httpClient.get(
        `${authConfig.reportCheckInEndpoint}/teacher/${param.teacherId}/classroom/${param.classroomId}/summary-report`,
      );
      return await data;
    } catch (err) {
      return err;
    }
  },
  removeReportCheckIn: async (token: string, id: string) => {
    try {
      const { data } = await httpClient.delete(`${authConfig.reportCheckInEndpoint}/${id}`);
      return await data;
    } catch (err) {
      return err;
    }
  },
  findDailyReportAdmin: async (token: string, param: any) => {
    try {
      const { data } = await httpClient.get(
        `${authConfig.reportCheckInEndpoint}/start-date/${param.startDate}/end-date/${param.endDate}/admin-daily-report`,
      );
      return await data;
    } catch (err) {
      return err;
    }
  },
  findStudentWeeklyReport: async (token: string, param: any) => {
    try {
      const { data } = await httpClient.get(
        `${authConfig.reportCheckInEndpoint}/student/${param.studentId}/classroom/${param.classroomId}/start-date/${param.start}/end-date/${param.end}/weekly-report`,
      );
      return await data;
    } catch (err) {
      return err;
    }
  },
}));
