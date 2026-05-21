import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';
import { queryKeys } from '@/libs/react-query/queryKeys';

interface VisitQuery {
  classroomId?: string;
  academicYear?: string;
  visitNo?: string;
  departmentId?: string;
  studentId?: string;
  skip?: number;
  take?: number;
  [key: string]: any;
}

export interface VisitMapData {
  mapSource?: 'google-maps';
  googleMapsUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  coordinates?: string | null;
  placeLabel?: string | null;
  landmark?: string | null;
  travelNote?: string | null;
}

export interface VisitDetailData {
  mapData?: VisitMapData | null;
}

export interface TeacherVisitStudentRow {
  id: string;
  studentKey: string;
  studentId: string;
  fullName: string;
  classroomId?: string | null;
  classroomName: string;
  visitId: string | null;
  visitDate: string | Date | null;
  visitNo: number | null;
  academicYear: string;
  visitStatus: 'recorded' | 'pending';
  images: string[];
  visitDetail?: VisitDetailData | null;
  visitMap?: string | null;
}

export interface AdminVisitSummaryRow {
  id: string;
  teacherName: string;
  visitDate: string;
  departmentName: string;
  classroomName: string;
  recordedStudentCount: number;
  studentCount: number;
}

export interface VisitPayload {
  studentKey: string;
  studentId: string;
  classroomId: string;
  visitDate: string;
  images: string[];
  academicYear?: string;
  visitDetail?: VisitDetailData | null;
  visitMap?: string | null;
}

const unwrapVisitArrayResponse = <T,>(response: unknown): T[] => {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as { data: unknown[] }).data)) {
    return (response as { data: T[] }).data;
  }

  return [];
};

/**
 * Hook to fetch visits list
 */
export const useVisits = (params?: VisitQuery) => {
  return useQuery({
    queryKey: queryKeys.visits.list(params),
    queryFn: async () => {
      const { data } = await httpClient.get(`${authConfig.visitEndpoint}/get-visit/all`, {
        params,
      });
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch advisor students with their latest visit status.
 * Backend scopes results to the authenticated teacher's assigned classrooms.
 */
export const useTeacherVisitStudents = (
  params?: Pick<VisitQuery, 'classroomId' | 'academicYear'>,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: queryKeys.visits.list({ ...params, scope: 'teacher-students' }),
    queryFn: async () => {
      const { data } = await httpClient.get(`${authConfig.visitEndpoint}/teacher/students`, {
        params,
      });
      return unwrapVisitArrayResponse<TeacherVisitStudentRow>(data);
    },
    enabled: options?.enabled ?? true,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook to fetch admin visit summary report grouped by teacher and visit date.
 */
export const useAdminVisitSummaryReport = (
  params?: Pick<VisitQuery, 'classroomId' | 'academicYear' | 'visitNo' | 'departmentId'>,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: queryKeys.visits.list({ ...params, scope: 'admin-summary' }),
    queryFn: async () => {
      const { data } = await httpClient.get(`${authConfig.visitEndpoint}/report/summary`, {
        params,
      });
      return unwrapVisitArrayResponse<AdminVisitSummaryRow>(data);
    },
    enabled: options?.enabled ?? true,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook to search visits
 */
export const useVisitSearch = (params?: VisitQuery) => {
  return useQuery({
    queryKey: queryKeys.visits.list(params),
    queryFn: async () => {
      const { data } = await httpClient.get(`${authConfig.visitEndpoint}/get-visit/all`, {
        params,
      });
      return data;
    },
    enabled: !!(params?.classroomId || params?.studentId || params?.academicYear),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch visit by ID
 */
export const useVisit = (visitId: string) => {
  return useQuery({
    queryKey: queryKeys.visits.detail(visitId),
    queryFn: async () => {
      const { data } = await httpClient.get(`${authConfig.visitEndpoint}/${visitId}`);
      return data;
    },
    enabled: !!visitId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch visits for a specific student
 */
export const useStudentVisits = (studentId: string, skip: number = 0, take: number = 10) => {
  return useQuery({
    queryKey: queryKeys.visits.student(studentId),
    queryFn: async () => {
      const { data } = await httpClient.get(
        `${authConfig.visitEndpoint}/${studentId}?skip=${skip}&take=${take}`
      );
      return data;
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create visit record
 */
export const useCreateVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: VisitPayload) => {
      const { data } = await httpClient.post(authConfig.visitEndpoint!, params);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.visits.all });
    },
  });
};

/**
 * Hook to update visit record
 */
export const useUpdateVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ visitId, params }: { visitId: string; params: VisitPayload }) => {
      const { data } = await httpClient.put(`${authConfig.visitEndpoint}/${visitId}`, params);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.visits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.visits.detail(variables.visitId) });
    },
  });
};

/**
 * Hook to delete visit record
 */
export const useDeleteVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (visitId: string) => {
      return await httpClient.delete(`${authConfig.visitEndpoint}/${visitId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.visits.all });
    },
  });
};
