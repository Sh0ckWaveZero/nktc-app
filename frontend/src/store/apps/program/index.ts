import { createWithEqualityFn } from 'zustand/traditional';

// ** Config
import { authConfig } from '@/configs/auth';
import httpClient from '@/@core/utils/http';

export interface ProgramType {
  id: string;
  programId: string;
  name: string;
  description?: string;
  levelId?: string;
  departmentId?: string;
  status?: string;
  created_at: string;
  updated_at: string;
  createdBy: string;
  updatedBy: string;
}

interface ProgramStoreState {
  programs: ProgramType[];
  loading: boolean;
  error: string | null;
  fetchPrograms: (params?: { search?: string }) => Promise<ProgramType[]>;
  createProgram: (data: Partial<ProgramType>) => Promise<ProgramType>;
  updateProgram: (id: string, data: Partial<ProgramType>) => Promise<ProgramType>;
  deleteProgram: (id: string) => Promise<void>;
  uploadPrograms: (file: File) => Promise<void>;
  setPrograms: (programs: ProgramType[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProgramStore = createWithEqualityFn<ProgramStoreState>()((set, get) => ({
  programs: [],
  loading: false,
  error: null,

  setPrograms: (programs: ProgramType[]) => set({ programs }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),

  /**
   * ดึงข้อมูลโปรแกรมทั้งหมด
   */
  fetchPrograms: async (params?: { search?: string }) => {
    try {
      set({ loading: true, error: null });

      const queryParams = new URLSearchParams();
      if (params?.search) {
        queryParams.append('search', params.search);
      }

      const url = `${authConfig.programEndpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const { data } = await httpClient.get(url);

      set({ programs: data, loading: false });
      return data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * สร้างโปรแกรมใหม่
   */
  createProgram: async (data: Partial<ProgramType>) => {
    try {
      set({ loading: true, error: null });

      const { data: newProgram } = await httpClient.post(authConfig.programEndpoint!, data);

      const currentPrograms = get().programs;
      set({
        programs: [newProgram, ...currentPrograms],
        loading: false,
      });

      return newProgram;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างโปรแกรม';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * อัปเดตโปรแกรม
   */
  updateProgram: async (id: string, data: Partial<ProgramType>) => {
    try {
      set({ loading: true, error: null });

      const { data: updatedProgram } = await httpClient.patch(`${authConfig.programEndpoint}/${id}`, data);

      const currentPrograms = get().programs;
      const updatedPrograms = currentPrograms.map((program) => (program.id === id ? updatedProgram : program));

      set({
        programs: updatedPrograms,
        loading: false,
      });

      return updatedProgram;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตโปรแกรม';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * ลบโปรแกรม
   */
  deleteProgram: async (id: string) => {
    try {
      set({ loading: true, error: null });

      await httpClient.delete(`${authConfig.programEndpoint}/${id}`);

      const currentPrograms = get().programs;
      const filteredPrograms = currentPrograms.filter((program) => program.id !== id);

      set({
        programs: filteredPrograms,
        loading: false,
      });
    } catch (error: any) {
      let errorMessage = 'เกิดข้อผิดพลาดในการลบโปรแกรม';
      if (error?.response?.status === 400 && error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * อัพโหลดไฟล์ Excel เพื่อนำเข้าข้อมูลสาขาวิชา
   */
  uploadPrograms: async (file: File) => {
    try {
      set({ loading: true, error: null });

      const formData = new FormData();
      formData.append('file', file);

      await httpClient.post(`${authConfig.programEndpoint}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // โหลดข้อมูลใหม่หลังจากอัพโหลด
      const { data: updatedPrograms } = await httpClient.get(authConfig.programEndpoint!);

      set({
        programs: updatedPrograms,
        loading: false,
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
}));
