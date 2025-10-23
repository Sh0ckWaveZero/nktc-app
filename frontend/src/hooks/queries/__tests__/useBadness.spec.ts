import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useBadnessRecords,
  useStudentBadnessRecords,
  useBadnessSummary,
  useCreateBadnessRecord,
  useDeleteBadnessRecord,
} from '../useBadness';
import httpClient from '@/@core/utils/http';

jest.mock('@/@core/utils/http');

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

describe('useBadness', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  describe('useBadnessRecords', () => {
    it('should fetch badness records', async () => {
      const mockData = [{ id: '1', studentId: 'S1', badDate: new Date() }];
      (httpClient.post as jest.Mock).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useBadnessRecords(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useStudentBadnessRecords', () => {
    it('should fetch badness records for student', async () => {
      const mockData = [{ id: '1', studentId: 'S1', badDate: new Date() }];
      (httpClient.get as jest.Mock).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useStudentBadnessRecords('S1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
    });

    it('should not fetch when studentId is empty', () => {
      const { result } = renderHook(() => useStudentBadnessRecords(''), { wrapper });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useBadnessSummary', () => {
    it('should fetch badness summary', async () => {
      const mockData = { totalRecords: 5, average: 3.2 };
      (httpClient.post as jest.Mock).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useBadnessSummary({ classroomId: 'C1' }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useCreateBadnessRecord', () => {
    it('should create badness record', async () => {
      const mockData = { id: '1', studentId: 'S1' };
      (httpClient.post as jest.Mock).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useCreateBadnessRecord(), { wrapper });

      result.current.mutate({ studentId: 'S1', badDate: new Date() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useDeleteBadnessRecord', () => {
    it('should delete badness record', async () => {
      (httpClient.delete as jest.Mock).mockResolvedValue({ data: { success: true } });

      const { result } = renderHook(() => useDeleteBadnessRecord(), { wrapper });

      result.current.mutate('1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });
});
