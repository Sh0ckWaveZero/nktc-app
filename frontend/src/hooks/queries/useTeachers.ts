import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';
import { queryKeys } from '@/libs/react-query/queryKeys';

interface TeacherQuery {
  q?: string;
  search?: string;
  firstName?: string;
  lastName?: string;
  departmentId?: string;
  [key: string]: any;
}

/**
 * Hook to fetch teachers list
 */
export const useTeachers = (params?: TeacherQuery) => {
  return useQuery({
    queryKey: queryKeys.teachers.list(params),
    queryFn: async () => {
      const { data } = await httpClient.get(authConfig.teacherEndpoint as string, {
        params,
      });
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to search teachers
 */
export const useTeachersSearch = (params?: TeacherQuery) => {
  return useQuery({
    queryKey: queryKeys.teachers.list(params),
    queryFn: async () => {
      const { data } = await httpClient.get(authConfig.teacherEndpoint as string, {
        params,
      });
      return data;
    },
    enabled: !!(params?.q || params?.search || params?.firstName || params?.lastName),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch teacher by ID
 */
export const useTeacher = (teacherId: string) => {
  return useQuery({
    queryKey: queryKeys.teachers.detail(teacherId),
    queryFn: async () => {
      const { data } = await httpClient.get(`${authConfig.teacherEndpoint}/${teacherId}`);
      return data;
    },
    enabled: !!teacherId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch students by teacher ID
 */
export const useTeacherStudents = (teacherId: string) => {
  return useQuery({
    queryKey: queryKeys.teachers.students(teacherId),
    queryFn: async () => {
      const { data } = await httpClient.get(`${authConfig.teacherEndpoint}/${teacherId}/students`);
      return data;
    },
    enabled: !!teacherId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch teacher classrooms
 */
export const useTeacherClassrooms = (teacherId: string) => {
  return useQuery({
    queryKey: queryKeys.teachers.classrooms(teacherId),
    queryFn: async () => {
      const { data } = await httpClient.get(`${authConfig.teacherEndpoint}/${teacherId}/classrooms`);
      return data;
    },
    enabled: !!teacherId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to create teacher
 */
export const useCreateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: any) => {
      const { data } = await httpClient.post(authConfig.teacherEndpoint as string, params);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
    },
  });
};

/**
 * Hook to update teacher profile
 */
export const useUpdateTeacherProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teacherId, params }: { teacherId: string; params: any }) => {
      const { data } = await httpClient.put(
        `${authConfig.teacherEndpoint}/${teacherId}/profile`,
        params
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.detail(variables.teacherId) });
    },
  });
};

/**
 * Hook to update teacher classrooms
 */
export const useUpdateTeacherClassrooms = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teacherId, params }: { teacherId: string; params: any }) => {
      const { data } = await httpClient.put(
        `${authConfig.teacherEndpoint}/${teacherId}/classrooms`,
        params
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.classrooms(variables.teacherId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.detail(variables.teacherId) });
    },
  });
};

/**
 * Hook to update teacher (full update)
 */
export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teacherId, params }: { teacherId: string; params: any }) => {
      const { data } = await httpClient.put(
        `${authConfig.teacherEndpoint}/${teacherId}`,
        params
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.detail(variables.teacherId) });
    },
  });
};

/**
 * Hook to delete teacher
 */
export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teacherId: string) => {
      return await httpClient.delete(`${authConfig.teacherEndpoint}/${teacherId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
    },
  });
};
