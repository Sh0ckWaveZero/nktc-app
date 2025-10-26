import { useQuery, useMutation } from '@tanstack/react-query';
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';
import { queryKeys } from '@/libs/react-query/queryKeys';

interface ReportQuery {
  teacherId?: string;
  classroomId?: string;
  studentId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  skip?: number;
  take?: number;
  [key: string]: any;
}

/**
 * Hook to fetch check-in summary report
 */
export const useCheckInSummaryReport = (params?: ReportQuery) => {
  return useQuery({
    queryKey: [...queryKeys.checkIn.all, 'summary', params],
    queryFn: async () => {
      const { data } = await httpClient.get(
        `${authConfig.reportCheckInEndpoint}/summary`,
        { params }
      );
      return data;
    },
    enabled: !!(params?.classroomId || params?.teacherId),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch activity check-in summary report
 */
export const useActivityCheckInSummaryReport = (params?: ReportQuery) => {
  return useQuery({
    queryKey: [...queryKeys.checkIn.all, 'activity-summary', params],
    queryFn: async () => {
      const { data } = await httpClient.get(
        `${authConfig.activityCheckInEndpoint}/summary`,
        { params }
      );
      return data;
    },
    enabled: !!(params?.classroomId || params?.teacherId),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch goodness behavior report
 */
export const useGoodnessReport = (params?: ReportQuery) => {
  return useQuery({
    queryKey: [...queryKeys.goodness.all, 'report', params],
    queryFn: async () => {
      const { data } = await httpClient.post(
        `${authConfig.goodnessIndividualEndpoint}/report`,
        params || {}
      );
      return data;
    },
    enabled: !!(params?.classroomId || params?.studentId),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch badness behavior report
 */
export const useBadnessReport = (params?: ReportQuery) => {
  return useQuery({
    queryKey: [...queryKeys.badness.all, 'report', params],
    queryFn: async () => {
      const { data } = await httpClient.post(
        `${authConfig.badnessIndividualEndpoint}/report`,
        params || {}
      );
      return data;
    },
    enabled: !!(params?.classroomId || params?.studentId),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch student comprehensive summary
 */
export const useStudentSummaryReport = (studentId: string) => {
  return useQuery({
    queryKey: ['student-summary', studentId],
    queryFn: async () => {
      const { data } = await httpClient.get(
        `${authConfig.studentEndpoint}/${studentId}/summary`
      );
      return data;
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to export report to PDF
 */
export const useExportReportPDF = () => {
  return useMutation({
    mutationFn: async (params: any) => {
      const response = await httpClient.post(
        `${authConfig.reportCheckInEndpoint}/export/pdf`,
        params,
        { responseType: 'arraybuffer' }
      );
      return response;
    },
  });
};

/**
 * Hook to export report to Excel
 */
export const useExportReportExcel = () => {
  return useMutation({
    mutationFn: async (params: any) => {
      const response = await httpClient.post(
        `${authConfig.reportCheckInEndpoint}/export/excel`,
        params,
        { responseType: 'arraybuffer' }
      );
      return response;
    },
  });
};

/**
 * Hook to generate attendance statistics
 */
export const useAttendanceStatistics = (params?: ReportQuery) => {
  return useQuery({
    queryKey: ['attendance-statistics', params],
    queryFn: async () => {
      const { data } = await httpClient.get(
        `${authConfig.reportCheckInEndpoint}/statistics`,
        { params }
      );
      return data;
    },
    enabled: !!(params?.classroomId || params?.teacherId),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to generate behavior statistics
 */
export const useBehaviorStatistics = (params?: ReportQuery) => {
  return useQuery({
    queryKey: ['behavior-statistics', params],
    queryFn: async () => {
      const { data } = await httpClient.get(
        `${authConfig.reportCheckInEndpoint}/behavior-statistics`,
        { params }
      );
      return data;
    },
    enabled: !!(params?.classroomId || params?.studentId),
    staleTime: 5 * 60 * 1000,
  });
};
