import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import httpClient from '@/@core/utils/http';
import { queryKeys } from '@/libs/react-query/queryKeys';
import type {
  AcademicCalendarSettings,
  CalendarEvent,
  CalendarEventFilters,
  CalendarEventInput,
} from '@/types/apps/academic-calendar';

const ENDPOINT = '/academic-calendar';

export const fetchCalendarSettingsForYear = async (year: number): Promise<AcademicCalendarSettings | null> => {
  const { data } = await httpClient.get<{ settings: AcademicCalendarSettings | null }>(`${ENDPOINT}/settings/${year}`);
  return data.settings;
};

/** ดึงการตั้งค่าภาคเรียนที่ใช้งานในปฏิทิน */
export const useAcademicCalendarSettings = () =>
  useQuery({
    queryKey: queryKeys.academicCalendar.settings(),
    queryFn: async () => {
      const { data } = await httpClient.get<{ settings: AcademicCalendarSettings | null }>(`${ENDPOINT}/settings`);
      return data.settings;
    },
  });

/** บันทึกทั้งสองภาคเรียนและเลือกภาคเรียนที่ใช้งาน */
export const useSaveAcademicCalendarSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: AcademicCalendarSettings) => {
      const { data } = await httpClient.put<AcademicCalendarSettings>(`${ENDPOINT}/settings`, settings);
      return data;
    },
    onSuccess: (settings) => {
      const previous = queryClient.getQueryData<AcademicCalendarSettings | null>(queryKeys.academicCalendar.settings());
      if (previous?.academicYear === settings.academicYear) queryClient.setQueryData(queryKeys.academicCalendar.settings(), settings);
      else void queryClient.invalidateQueries({ queryKey: queryKeys.academicCalendar.settings() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.academicYears.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.checkIn.termSummaries() });
    },
  });
};

/** ดึงกิจกรรมที่อยู่ในช่วงวันที่หรือที่กำลังจะเริ่ม */
export const useCalendarEvents = (filters: CalendarEventFilters) =>
  useQuery({
    queryKey: queryKeys.academicCalendar.eventList(filters),
    queryFn: async () => {
      const { data } = await httpClient.get<CalendarEvent[]>(`${ENDPOINT}/events`, { params: filters });
      return data;
    },
  });

/** เพิ่มกิจกรรมในปฏิทิน */
export const useCreateCalendarEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (event: CalendarEventInput) => {
      const { data } = await httpClient.post<CalendarEvent>(`${ENDPOINT}/events`, event);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.academicCalendar.events() }),
  });
};

/** แก้ไขกิจกรรมในปฏิทิน */
export const useUpdateCalendarEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, event }: { id: string; event: CalendarEventInput }) => {
      const { data } = await httpClient.put<CalendarEvent>(`${ENDPOINT}/events/${id}`, event);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.academicCalendar.events() }),
  });
};

/** ลบกิจกรรมออกจากปฏิทิน */
export const useDeleteCalendarEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await httpClient.delete(`${ENDPOINT}/events/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.academicCalendar.events() }),
  });
};
