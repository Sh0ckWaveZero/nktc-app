import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  useCheckInSummaryReport,
  useActivityCheckInSummaryReport,
  useGoodnessReport,
  useBadnessReport,
  useStudentSummaryReport,
  useExportReportPDF,
  useExportReportExcel,
} from '../useReports';
import httpClient from '@/@core/utils/http';

vi.mock('@/@core/utils/http');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = (props: any) => {
  const { children } = props;
  return (QueryClientProvider as any)({ client: queryClient, children });
};

describe('useReports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  describe('useCheckInSummaryReport', () => {
    it('should fetch check-in summary report', async () => {
      const mockData = { totalPresent: 30, totalAbsent: 5 };
      vi.mocked(httpClient.get).mockResolvedValue({ data: mockData });

      const { result } = renderHook(
        () => useCheckInSummaryReport({ classroomId: 'C1' }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useActivityCheckInSummaryReport', () => {
    it('should fetch activity check-in summary report', async () => {
      const mockData = { totalActivities: 10, averageAttendance: 85 };
      vi.mocked(httpClient.get).mockResolvedValue({ data: mockData });

      const { result } = renderHook(
        () => useActivityCheckInSummaryReport({ classroomId: 'C1' }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useGoodnessReport', () => {
    it('should fetch goodness behavior report', async () => {
      const mockData = { totalRecords: 50, students: [] };
      vi.mocked(httpClient.post).mockResolvedValue({ data: mockData });

      const { result } = renderHook(
        () => useGoodnessReport({ classroomId: 'C1' }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useBadnessReport', () => {
    it('should fetch badness behavior report', async () => {
      const mockData = { totalRecords: 10, students: [] };
      vi.mocked(httpClient.post).mockResolvedValue({ data: mockData });

      const { result } = renderHook(
        () => useBadnessReport({ classroomId: 'C1' }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useStudentSummaryReport', () => {
    it('should fetch student summary report', async () => {
      const mockData = { studentId: 'S1', attendance: 95, behavior: 8 };
      vi.mocked(httpClient.get).mockResolvedValue({ data: mockData });

      const { result } = renderHook(
        () => useStudentSummaryReport('S1'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
    });

    it('should not fetch when studentId is empty', () => {
      const { result } = renderHook(
        () => useStudentSummaryReport(''),
        { wrapper }
      );

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useExportReportPDF', () => {
    it('should export report to PDF', async () => {
      const mockPdfBuffer = new ArrayBuffer(8);
      vi.mocked(httpClient.post).mockResolvedValue({ data: mockPdfBuffer });

      const { result } = renderHook(() => useExportReportPDF(), { wrapper });

      result.current.mutate({ classroomId: 'C1' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.data).toBeDefined();
    });
  });

  describe('useExportReportExcel', () => {
    it('should export report to Excel', async () => {
      const mockExcelBuffer = new ArrayBuffer(8);
      vi.mocked(httpClient.post).mockResolvedValue({ data: mockExcelBuffer });

      const { result } = renderHook(() => useExportReportExcel(), { wrapper });

      result.current.mutate({ classroomId: 'C1' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.data).toBeDefined();
    });
  });
});
