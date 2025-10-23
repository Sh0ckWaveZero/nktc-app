import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useVisits,
  useVisit,
  useStudentVisits,
  useCreateVisit,
  useUpdateVisit,
  useDeleteVisit,
} from '../useVisits';
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

describe('useVisits', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  describe('useVisits', () => {
    it('should fetch visits list', async () => {
      const mockData = [{ id: '1', studentId: 'S1', visitDate: new Date() }];
      (httpClient.get as jest.Mock).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useVisits(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useVisit', () => {
    it('should fetch visit by ID', async () => {
      const mockData = { id: '1', studentId: 'S1', visitDate: new Date() };
      (httpClient.get as jest.Mock).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useVisit('1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
    });

    it('should not fetch when visitId is empty', () => {
      const { result } = renderHook(() => useVisit(''), { wrapper });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useStudentVisits', () => {
    it('should fetch visits for student', async () => {
      const mockData = [{ id: '1', studentId: 'S1', visitDate: new Date() }];
      (httpClient.get as jest.Mock).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useStudentVisits('S1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
    });

    it('should not fetch when studentId is empty', () => {
      const { result } = renderHook(() => useStudentVisits(''), { wrapper });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useCreateVisit', () => {
    it('should create visit record', async () => {
      const mockData = { id: '1', studentId: 'S1' };
      (httpClient.post as jest.Mock).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useCreateVisit(), { wrapper });

      result.current.mutate({ studentId: 'S1', visitDate: new Date() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useUpdateVisit', () => {
    it('should update visit record', async () => {
      const mockData = { id: '1', studentId: 'S1' };
      (httpClient.put as jest.Mock).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useUpdateVisit(), { wrapper });

      result.current.mutate({ visitId: '1', params: { visitDate: new Date() } });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('useDeleteVisit', () => {
    it('should delete visit record', async () => {
      (httpClient.delete as jest.Mock).mockResolvedValue({ data: { success: true } });

      const { result } = renderHook(() => useDeleteVisit(), { wrapper });

      result.current.mutate('1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });
});
