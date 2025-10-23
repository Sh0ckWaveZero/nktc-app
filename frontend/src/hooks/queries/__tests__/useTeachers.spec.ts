import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useTeachers,
  useTeacher,
  useTeacherStudents,
  useTeacherClassrooms,
  useCreateTeacher,
  useDeleteTeacher,
} from '../useTeachers';
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
  // Using createElement to avoid JSX syntax issues in test files
  return (QueryClientProvider as any)({ client: queryClient, children });
};

describe('useTeachers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  describe('useTeachers', () => {
    it('should fetch teachers list', async () => {
      const mockData = [{ id: '1', firstName: 'John', lastName: 'Doe' }];
      (httpClient.get as jest.Mock).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useTeachers(), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
    });

    it('should handle errors', async () => {
      const mockError = new Error('Network error');
      (httpClient.get as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useTeachers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useTeacher', () => {
    it('should fetch teacher by ID', async () => {
      const mockData = { id: '1', firstName: 'John', lastName: 'Doe' };
      (httpClient.get as jest.Mock).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useTeacher('1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
    });

    it('should not fetch when teacherId is empty', () => {
      const { result } = renderHook(() => useTeacher(''), { wrapper });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useTeacherStudents', () => {
    it('should fetch students by teacher ID', async () => {
      const mockData = [{ id: '1', fullName: 'Student 1' }];
      (httpClient.get as jest.Mock).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useTeacherStudents('1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useTeacherClassrooms', () => {
    it('should fetch classrooms by teacher ID', async () => {
      const mockData = [{ id: '1', name: 'Class A' }];
      (httpClient.get as jest.Mock).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useTeacherClassrooms('1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useCreateTeacher', () => {
    it('should create teacher', async () => {
      const mockData = { id: '1', firstName: 'John', lastName: 'Doe' };
      (httpClient.post as jest.Mock).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useCreateTeacher(), { wrapper });

      result.current.mutate({ firstName: 'John', lastName: 'Doe' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useDeleteTeacher', () => {
    it('should delete teacher', async () => {
      (httpClient.delete as jest.Mock).mockResolvedValue({ data: { success: true } });

      const { result } = renderHook(() => useDeleteTeacher(), { wrapper });

      result.current.mutate('1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });
});
