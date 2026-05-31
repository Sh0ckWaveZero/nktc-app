import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import httpClient from '@/@core/utils/http';
import { aggregateCheckInReports, useCheckInReportsByClassrooms } from '../useCheckIn';

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

describe('useCheckIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('aggregates daily check-in arrays across multiple classrooms', () => {
    const aggregated = aggregateCheckInReports([
      {
        data: {
          present: ['student-1', 'student-2', 'student-3'],
          absent: ['student-4'],
          late: ['student-5'],
          leave: [],
          internship: [],
        },
      },
      {
        present: ['student-6', 'student-7'],
        absent: ['student-8', 'student-9'],
        late: [],
        leave: ['student-10'],
        internship: ['student-11'],
      },
    ]);

    expect(aggregated.present).toHaveLength(5);
    expect(aggregated.absent).toHaveLength(3);
    expect(aggregated.late).toHaveLength(1);
    expect(aggregated.leave).toHaveLength(1);
    expect(aggregated.internship).toHaveLength(1);
    expect(aggregated.totalChecked).toBe(11);
  });

  it('fetches and aggregates check-in reports for multiple classrooms', async () => {
    vi.mocked(httpClient.get)
      .mockResolvedValueOnce({
        data: {
          present: ['student-1', 'student-2'],
          absent: ['student-3'],
          late: [],
          leave: [],
          internship: [],
        },
      } as never)
      .mockResolvedValueOnce({
        data: {
          present: ['student-4', 'student-5'],
          absent: ['student-6', 'student-7'],
          late: [],
          leave: ['student-8'],
          internship: [],
        },
      } as never);

    const { result } = renderHook(
      () =>
        useCheckInReportsByClassrooms({
          teacherId: 'teacher-1',
          classroomIds: ['class-1', 'class-2'],
          date: '2026-05-29',
        }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(httpClient.get).toHaveBeenCalledTimes(2);
    expect(result.current.data.present).toHaveLength(4);
    expect(result.current.data.absent).toHaveLength(3);
    expect(result.current.data.leave).toHaveLength(1);
    expect(result.current.data.totalChecked).toBe(8);
  });
});