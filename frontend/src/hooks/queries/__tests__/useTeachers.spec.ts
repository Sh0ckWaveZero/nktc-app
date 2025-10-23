import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTeachers } from '../useTeachers';
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

describe('useTeachers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  describe('useTeachers', () => {
    it('should fetch teachers list', async () => {
      const mockData = [{ id: '1', firstName: 'John', lastName: 'Doe' }];
      vi.mocked(httpClient.get).mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useTeachers(), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
    });

    it('should handle errors', async () => {
      const mockError = new Error('Network error');
      vi.mocked(httpClient.get).mockRejectedValue(mockError);

      const { result } = renderHook(() => useTeachers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });
  });

});
