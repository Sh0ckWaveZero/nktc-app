import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement, type ReactNode } from 'react';
import { useAdminVisitSummaryReport } from '../useVisits';
import httpClient from '@/@core/utils/http';

vi.mock('@/@core/utils/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useAdminVisitSummaryReport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches admin visit summary rows', async () => {
    const mockRows = [
      {
        id: 'teacher-1:2026-05-21:department-1',
        teacherName: 'อาจารย์สมชาย ใจดี',
        visitDate: '2026-05-21',
        latestRecordedAt: '2026-05-21',
        departmentName: 'ช่างยนต์',
        classroomName: 'ปวช.1/1',
        recordedStudentCount: 3,
        studentCount: 12,
      },
    ];

    vi.mocked(httpClient.get).mockResolvedValue({ data: mockRows } as never);

    const { result } = renderHook(() => useAdminVisitSummaryReport({ academicYear: '2569', departmentId: 'dep-1' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(httpClient.get).toHaveBeenCalledWith('/visits/report/summary', {
      params: { academicYear: '2569', departmentId: 'dep-1' },
    });
    expect(result.current.data).toEqual(mockRows);
  });
});
