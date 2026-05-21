import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement, type ReactNode } from 'react';
import { useTeacherVisitStudents } from '../useVisits';
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

describe('useTeacherVisitStudents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches teacher-scoped visit rows', async () => {
    const mockRows = [
      {
        id: 'student-1',
        studentKey: 'student-1',
        studentId: '67001',
        fullName: 'นายต้น กล้า',
        classroomId: 'class-1',
        classroomName: 'ปวช.1/1',
        visitId: 'visit-1',
        visitDate: '2026-05-21T00:00:00.000Z',
        visitNo: 1,
        academicYear: '2569',
        visitStatus: 'recorded',
        images: ['img-1', 'img-2', 'img-3'],
      },
    ];

    vi.mocked(httpClient.get).mockResolvedValue({ data: mockRows } as never);

    const { result } = renderHook(
      () => useTeacherVisitStudents({ classroomId: 'class-1', academicYear: '2569' }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(httpClient.get).toHaveBeenCalledWith('/api/backend/visits/teacher/students', {
      params: { classroomId: 'class-1', academicYear: '2569' },
    });
    expect(result.current.data).toEqual(mockRows);
  });
});