import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useGoodnessRecords,
  useStudentGoodnessRecords,
  useGoodnessSummary,
  useCreateGoodnessRecord,
  useDeleteGoodnessRecord,
} from '../useGoodness';
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

describe('useGoodness', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  describe('useGoodnessRecords', () => {
    it('should fetch goodness records', async () => {
      const mockData = [{ id: '1', studentId: 'S1', goodDate: new Date() }];
      (httpClient.post as jest.Mock).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useGoodnessRecords(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useStudentGoodnessRecords', () => {
    it('should fetch goodness records for student', async () => {
      const mockData = [{ id: '1', studentId: 'S1', goodDate: new Date() }];
      (httpClient.get as jest.Mock).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useStudentGoodnessRecords('S1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
    });

    it('should not fetch when studentId is empty', () => {
      const { result } = renderHook(() => useStudentGoodnessRecords(''), { wrapper });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useGoodnessSummary', () => {
    it('should fetch goodness summary', async () => {
      const mockData = { totalRecords: 10, average: 8.5 };
      (httpClient.post as jest.Mock).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useGoodnessSummary({ classroomId: 'C1' }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useCreateGoodnessRecord', () => {
    it('should create goodness record', async () => {
      const mockData = { id: '1', studentId: 'S1' };
      (httpClient.post as jest.Mock).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useCreateGoodnessRecord(), { wrapper });

      result.current.mutate({ studentId: 'S1', goodDate: new Date() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useDeleteGoodnessRecord', () => {
    it('should delete goodness record', async () => {
      (httpClient.delete as jest.Mock).mockResolvedValue({ data: { success: true } });

      const { result } = renderHook(() => useDeleteGoodnessRecord(), { wrapper });

      result.current.mutate('1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });
});
