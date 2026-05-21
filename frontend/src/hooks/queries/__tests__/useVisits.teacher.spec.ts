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

  it('refetches teacher-scoped rows when advisor classrooms change', async () => {
    const firstRows = [
      {
        id: 'student-1',
        studentKey: 'student-1',
        studentId: '67001',
        fullName: 'เธเธฒเธขเธ•เนเธ เธเธฅเนเธฒ',
        classroomId: 'class-1',
        classroomName: 'เธเธงเธ.1/1',
        visitId: null,
        visitDate: null,
        visitNo: null,
        academicYear: '2569',
        visitStatus: 'pending',
        images: [],
      },
    ];
    const updatedRows = [
      ...firstRows,
      {
        id: 'student-2',
        studentKey: 'student-2',
        studentId: '67002',
        fullName: 'เธเธฒเธเธชเธฒเธงเธเนเธฒ เธเธฅเนเธฒ',
        classroomId: 'class-2',
        classroomName: 'เธเธงเธ.1/2',
        visitId: null,
        visitDate: null,
        visitNo: null,
        academicYear: '2569',
        visitStatus: 'pending',
        images: [],
      },
    ];

    vi.mocked(httpClient.get)
      .mockResolvedValueOnce({ data: firstRows } as never)
      .mockResolvedValueOnce({ data: updatedRows } as never);

    const { result, rerender } = renderHook(
      ({ advisorClassroomIds }: { advisorClassroomIds: string[] }) =>
        useTeacherVisitStudents(undefined, { advisorClassroomIds }),
      {
        wrapper: createWrapper(),
        initialProps: { advisorClassroomIds: ['class-1'] },
      },
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(firstRows);
    });

    rerender({ advisorClassroomIds: ['class-1', 'class-2'] });

    await waitFor(() => {
      expect(result.current.data).toEqual(updatedRows);
    });

    expect(httpClient.get).toHaveBeenCalledTimes(2);
  });
});
