import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import httpClient from '@/@core/utils/http';
import { queryKeys } from '@/libs/react-query/queryKeys';
import { authConfig } from '@/configs/auth';

export interface DepartmentStats {
  teacher: number;
  student: number;
  program: number;
  classroom: number;
}

export interface DepartmentItem {
  id: string;
  departmentId?: string | null;
  name: string;
  description?: string | null;
  status?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  _count: DepartmentStats;
}

export interface DepartmentPayload {
  departmentId?: string;
  name: string;
  description?: string;
  status?: string;
}

export interface DepartmentImportError {
  row: number;
  message: string;
}

export interface DepartmentImportResult {
  success: boolean;
  message: string;
  total: number;
  imported: number;
  updated: number;
  failed: number;
  errors: DepartmentImportError[];
}

export interface LevelItem {
  id: string;
  levelId?: string | null;
  levelName: string;
}

export interface ProgramStats {
  student: number;
  classroom: number;
  teacher: number;
  course: number;
  levelClassroom: number;
}

export interface ProgramItem {
  id: string;
  programId: string;
  name: string;
  description?: string | null;
  status?: string | null;
  departmentId?: string | null;
  levelId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  department?: DepartmentItem | null;
  level?: LevelItem | null;
  _count: ProgramStats;
}

export interface ProgramPayload {
  programId?: string;
  name: string;
  description?: string;
  departmentId?: string;
  levelId?: string;
  status?: string;
}

export interface ProgramImportError {
  row: number;
  message: string;
}

export interface ProgramImportResult {
  success: boolean;
  message: string;
  total: number;
  imported: number;
  updated: number;
  failed: number;
  errors: ProgramImportError[];
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

const departmentEndpoint = authConfig.departmentEndpoint as string;
const programEndpoint = authConfig.programEndpoint as string;
const levelEndpoint = authConfig.levelEndpoint as string;

const normalizeDepartment = (department: any): DepartmentItem => ({
  id: department.id,
  departmentId: department.departmentId ?? null,
  name: department.name ?? '',
  description: department.description ?? null,
  status: department.status ?? null,
  createdAt: department.createdAt,
  updatedAt: department.updatedAt,
  createdBy: department.createdBy ?? null,
  updatedBy: department.updatedBy ?? null,
  _count: {
    teacher: department._count?.teacher ?? 0,
    student: department._count?.student ?? 0,
    program: department._count?.program ?? 0,
    classroom: department._count?.classroom ?? 0,
  },
});

const normalizeLevel = (level: any): LevelItem => ({
  id: level.id,
  levelId: level.levelId ?? null,
  levelName: level.levelName ?? '',
});

const normalizeProgram = (program: any): ProgramItem => ({
  id: program.id,
  programId: program.programId ?? '',
  name: program.name ?? '',
  description: program.description ?? null,
  status: program.status ?? null,
  departmentId: program.departmentId ?? null,
  levelId: program.levelId ?? null,
  createdAt: program.createdAt,
  updatedAt: program.updatedAt,
  createdBy: program.createdBy ?? null,
  updatedBy: program.updatedBy ?? null,
  department: program.department ? normalizeDepartment(program.department) : null,
  level: program.level ? normalizeLevel(program.level) : null,
  _count: {
    student: program._count?.student ?? 0,
    classroom: program._count?.classroom ?? 0,
    teacher: program._count?.teacher ?? 0,
    course: program._count?.course ?? 0,
    levelClassroom: program._count?.levelClassroom ?? 0,
  },
});

/**
 * Hook to fetch all departments
 */
export const useDepartments = () => {
  return useQuery({
    queryKey: queryKeys.departments.all,
    queryFn: async () => {
      const { data } = await httpClient.get(departmentEndpoint);
      return unwrapArrayResponse<DepartmentItem>(data).map(normalizeDepartment);
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - departments rarely change
    gcTime: 60 * 60 * 1000, // 1 hour cache
  });
};

export const useDepartment = (departmentId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.departments.detail(departmentId),
    queryFn: async () => {
      const { data } = await httpClient.get(`${departmentEndpoint}/${departmentId}`);
      return normalizeDepartment(unwrapResponse<DepartmentItem>(data));
    },
    enabled: options?.enabled ?? !!departmentId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: DepartmentPayload) => {
      const { data } = await httpClient.post(departmentEndpoint, params);
      return normalizeDepartment(unwrapResponse<DepartmentItem>(data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, params }: { id: string; params: Partial<DepartmentPayload> }) => {
      const { data } = await httpClient.patch(`${departmentEndpoint}/${id}`, params);
      return normalizeDepartment(unwrapResponse<DepartmentItem>(data));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.detail(variables.id) });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await httpClient.delete(`${departmentEndpoint}/${id}`);
      return unwrapResponse<{ success: boolean; message: string }>(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
    },
  });
};

export const useImportDepartments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file }: { file: string }) => {
      const { data } = await httpClient.post(`${departmentEndpoint}/upload`, {
        file,
      });
      return data as DepartmentImportResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
    },
  });
};

export const useLevels = () => {
  return useQuery({
    queryKey: ['levels'],
    queryFn: async () => {
      const { data } = await httpClient.get(levelEndpoint);
      return unwrapArrayResponse<LevelItem>(data).map(normalizeLevel);
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

/**
 * Hook to fetch all programs
 */
export const usePrograms = () => {
  return useQuery({
    queryKey: queryKeys.programs.all,
    queryFn: async () => {
      const { data } = await httpClient.get(programEndpoint);
      return unwrapArrayResponse<ProgramItem>(data).map(normalizeProgram);
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - programs rarely change
    gcTime: 60 * 60 * 1000, // 1 hour cache
  });
};

export const useProgram = (programId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.programs.detail(programId),
    queryFn: async () => {
      const { data } = await httpClient.get(`${programEndpoint}/${programId}`);
      return normalizeProgram(unwrapResponse<ProgramItem>(data));
    },
    enabled: options?.enabled ?? !!programId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ProgramPayload) => {
      const { data } = await httpClient.post(programEndpoint, params);
      return normalizeProgram(unwrapResponse<ProgramItem>(data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.programs.all });
    },
  });
};

export const useUpdateProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, params }: { id: string; params: Partial<ProgramPayload> }) => {
      const { data } = await httpClient.patch(`${programEndpoint}/${id}`, params);
      return normalizeProgram(unwrapResponse<ProgramItem>(data));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.programs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.programs.detail(variables.id) });
    },
  });
};

export const useDeleteProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await httpClient.delete(`${programEndpoint}/${id}`);
      return unwrapResponse<{ success: boolean; message: string }>(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.programs.all });
    },
  });
};

export const useImportPrograms = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file }: { file: string }) => {
      const { data } = await httpClient.post(`${programEndpoint}/upload`, {
        file,
      });
      return data as ProgramImportResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.programs.all });
    },
  });
};
