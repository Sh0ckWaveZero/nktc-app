import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import httpClient from '@/@core/utils/http';
import { queryKeys } from '@/libs/react-query/queryKeys';
import type { AcademicCalendarSettings } from '@/types/apps/academic-calendar';
import type { AcademicYearContext, AcademicYearManagement } from '@/types/apps/academic-year';

/** ดึงปีที่เปิดใช้แล้วสำหรับการทำงานและดูย้อนหลัง */
export const useAcademicYearsContext = () =>
  useQuery({
    queryKey: queryKeys.academicYears.context(),
    queryFn: async ({ signal }): Promise<AcademicYearContext> => {
      const { data } = await httpClient.get<AcademicYearContext>('/academic-years/context', { signal });
      return data;
    },
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  });

/** ดึงปีทั้งหมดและจำนวนบันทึกสำหรับ Admin */
export const useAcademicYearsManagement = () =>
  useQuery({
    queryKey: queryKeys.academicYears.management(),
    queryFn: async ({ signal }): Promise<AcademicYearManagement> => {
      const { data } = await httpClient.get<AcademicYearManagement>('/academic-years/', { signal });
      return data;
    },
  });

/** สร้างปีใหม่เป็น Draft พร้อม Calendar */
export const useCreateAcademicYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AcademicCalendarSettings): Promise<void> => {
      await httpClient.post('/academic-years/', input);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.academicYears.management() }),
  });
};

/** ยืนยันเปิดปีใหม่ โดยใช้ Version ป้องกันการยืนยันจากข้อมูลเก่า */
export const useActivateAcademicYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      academicYear,
      expectedVersion,
    }: {
      academicYear: number;
      expectedVersion: number;
    }): Promise<void> => {
      await httpClient.post(`/academic-years/${academicYear}/activate`, { expectedVersion });
    },
    // Provider refreshes Context after selecting the newly active year.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.academicYears.all, refetchType: 'none' }),
  });
};
