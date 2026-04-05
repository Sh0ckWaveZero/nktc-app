import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';
import { queryKeys } from '@/libs/react-query/queryKeys';
import type { DepartmentItem, LevelItem, ProgramItem } from './useDepartments';

interface ClassroomQuery {
  q?: string;
  departmentId?: string;
  programId?: string;
}

export interface ClassroomStats {
  student: number;
  teachers: number;
  course: number;
  reportCheckIn: number;
  activityCheckInReport: number;
  levelClassrooms: number;
}

export interface ClassroomItem {
  id: string;
  classroomId: string;
  name: string;
  description?: string | null;
  status?: string | null;
  departmentId?: string | null;
  programId?: string | null;
  levelId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  department?: DepartmentItem | null;
  program?: ProgramItem | null;
  level?: LevelItem | null;
  _count: ClassroomStats;
}

export interface ClassroomPayload {
  classroomId?: string;
  name: string;
  description?: string;
  departmentId?: string;
  programId?: string;
  levelId?: string;
  status?: string;
}

export interface ClassroomImportError {
  row: number;
  message: string;
}

export interface ClassroomImportResult {
  success: boolean;
  message: string;
  total: number;
  imported: number;
  updated: number;
  failed: number;
  errors: ClassroomImportError[];
}

function unwrapResponse<T>(response: any): T {
  if (response && typeof response === 'object' && 'data' in response && 'success' in response) {
    return response.data as T;
  }

  return response as T;
}

function unwrapArrayResponse<T>(response: any): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
    return response.data as T[];
  }

  return [];
}

const classroomEndpoint = authConfig.classroomEndpoint as string;

const normalizeClassroom = (classroom: any): ClassroomItem => ({
  id: classroom.id,
  classroomId: classroom.classroomId ?? '',
  name: classroom.name ?? '',
  description: classroom.description ?? null,
  status: classroom.status ?? null,
  departmentId: classroom.departmentId ?? null,
  programId: classroom.programId ?? null,
  levelId: classroom.levelId ?? null,
  createdAt: classroom.createdAt,
  updatedAt: classroom.updatedAt,
  createdBy: classroom.createdBy ?? null,
  updatedBy: classroom.updatedBy ?? null,
  department: classroom.department ?? null,
  program: classroom.program ?? null,
  level: classroom.level ?? null,
  _count: {
    student: classroom._count?.student ?? 0,
    teachers: classroom._count?.teachers ?? 0,
    course: classroom._count?.course ?? 0,
    reportCheckIn: classroom._count?.reportCheckIn ?? 0,
    activityCheckInReport: classroom._count?.activityCheckInReport ?? 0,
    levelClassrooms: classroom._count?.levelClassrooms ?? 0,
  },
});

/**
 * Hook to fetch classrooms list
 */
export const useClassrooms = (params?: ClassroomQuery) => {
  return useQuery({
    queryKey: queryKeys.classrooms.list(params),
    queryFn: async () => {
      const { data } = await httpClient.get(classroomEndpoint, {
        params,
      });
      return unwrapArrayResponse<ClassroomItem>(data).map(normalizeClassroom);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch teacher's assigned classrooms with students
 * This endpoint returns only classrooms assigned to the teacher
 */
export const useTeacherClassrooms = (teacherId: string) => {
  return useQuery({
    queryKey: queryKeys.classrooms.list({ teacherId }),
    queryFn: async () => {
      const { data } = await httpClient.get(`${authConfig.teacherEndpoint}/${teacherId}/classrooms-and-students`);

      // Returns array of classrooms with students: [{ id, name, students: [], ... }]
      if (Array.isArray(data)) {
        return data;
      }

      if (data && typeof data === 'object') {
        if ('success' in data && 'data' in data && Array.isArray(data.data)) {
          return data.data;
        }
        if ('data' in data && Array.isArray(data.data)) {
          return data.data;
        }
      }

      return [];
    },
    enabled: !!teacherId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch classroom by ID
 */
export const useClassroom = (classroomId: string) => {
  return useQuery({
    queryKey: queryKeys.classrooms.detail(classroomId),
    queryFn: async () => {
      const { data } = await httpClient.get(`${classroomEndpoint}/${classroomId}`);
      return normalizeClassroom(unwrapResponse<ClassroomItem>(data));
    },
    enabled: !!classroomId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateClassroom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ClassroomPayload) => {
      const { data } = await httpClient.post(classroomEndpoint, params);
      return normalizeClassroom(unwrapResponse<ClassroomItem>(data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classrooms.all });
    },
  });
};

export const useUpdateClassroom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, params }: { id: string; params: Partial<ClassroomPayload> }) => {
      const { data } = await httpClient.patch(`${classroomEndpoint}/${id}`, params);
      return normalizeClassroom(unwrapResponse<ClassroomItem>(data));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classrooms.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.classrooms.detail(variables.id) });
    },
  });
};

export const useDeleteClassroom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await httpClient.delete(`${classroomEndpoint}/${id}`);
      return unwrapResponse<{ success: boolean; message: string }>(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classrooms.all });
    },
  });
};

export const useImportClassrooms = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file }: { file: string }) => {
      const { data } = await httpClient.post(`${classroomEndpoint}/upload`, { file });
      return data as ClassroomImportResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classrooms.all });
    },
  });
};

/**
 * Hook to fetch classroom students
 */
export const useClassroomStudents = (classroomId: string) => {
  return useQuery({
    queryKey: queryKeys.classrooms.students(classroomId),
    queryFn: async () => {
      const { data } = await httpClient.get(`${authConfig.classroomEndpoint}/${classroomId}/students`);
      return data;
    },
    enabled: !!classroomId,
    staleTime: 5 * 60 * 1000,
  });
};
