import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useCheckInReport } from '../useCheckInReport';
import { toApiDate } from '@/utils/datetime';

const { classroomQuery, reportQuery, saveCheckIn, deleteCheckIn } = vi.hoisted(() => ({
  classroomQuery: {
    data: [
      {
        id: 'classroom-1',
        name: 'ปวช.1/1',
        students: [
          {
            id: 'student-1',
            studentId: '66001',
            user: { account: { firstName: 'ทดสอบ', lastName: 'ระบบ', title: 'นาย' } },
          },
          {
            id: 'student-2',
            studentId: '66002',
            user: { account: { firstName: 'นักเรียน', lastName: 'คนที่สอง', title: 'นางสาว' } },
          },
          {
            id: 'student-3',
            studentId: '66003',
            user: { account: { firstName: 'นักเรียน', lastName: 'คนที่สาม', title: 'นาย' } },
          },
        ],
      },
    ],
    isLoading: false,
    error: null,
  },
  reportQuery: { data: null as unknown },
  saveCheckIn: vi.fn(),
  deleteCheckIn: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { teacher: { id: 'teacher-1' } } }),
}));

vi.mock('@/hooks/queries/useCheckIn', () => ({
  useTeacherClassroomsAndStudents: () => classroomQuery,
  useSaveCheckIn: () => ({ mutate: saveCheckIn, isPending: false }),
  useDeleteCheckIn: () => ({ mutate: deleteCheckIn, isPending: false }),
  useCheckInReports: () => reportQuery,
}));

const theme = createTheme();
const wrapper = ({ children }: { children: ReactNode }) => createElement(ThemeProvider, { theme }, children);

describe('useCheckInReport mobile status selection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reportQuery.data = null;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('stores a student id when mobile passes the id as a string', async () => {
    const { result } = renderHook(() => useCheckInReport(), { wrapper });

    await waitFor(() => expect(result.current.currentStudents).toHaveLength(3));

    expect(result.current.mobileStudentFilter).toBe('pending');
    expect(result.current.mobilePageSize).toBe(2);
    expect(result.current.getPaginatedStudents().map((student) => student.id)).toEqual(['student-1', 'student-2']);

    act(() => result.current.onHandleToggle('late', 'student-1'));

    expect(result.current.isLateCheck).toEqual(['student-1']);
    expect(result.current.getPaginatedStudents().map((student) => student.id)).toEqual(['student-2', 'student-3']);

    act(() => result.current.handleMobileStudentFilterChange('all'));

    expect(result.current.getPaginatedStudents().map((student) => student.id)).toEqual(['student-1', 'student-2']);

    act(() => result.current.onHandleToggle('', 'student-1'));

    expect(result.current.isLateCheck).toEqual([]);
  });

  it('deletes the saved development record and clears the check-in state', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    reportQuery.data = {
      id: 'report-1',
      checkInDate: toApiDate(new Date()),
      present: ['student-1'],
      absent: ['student-2'],
      late: ['student-3'],
      leave: [],
      internship: [],
    };

    const { result } = renderHook(() => useCheckInReport(), { wrapper });

    await waitFor(() => expect(result.current.hasSavedCheckIn).toBe(true));

    act(() => result.current.handleResetCheckIn());

    expect(deleteCheckIn).toHaveBeenCalledWith('report-1', expect.objectContaining({ onSuccess: expect.any(Function) }));

    const mutationOptions = deleteCheckIn.mock.calls[0]?.[1];
    act(() => mutationOptions.onSuccess());

    expect(result.current.hasSavedCheckIn).toBe(false);
    expect(result.current.isPresentCheck).toEqual([]);
    expect(result.current.isAbsentCheck).toEqual([]);
    expect(result.current.isLateCheck).toEqual([]);
    expect(result.current.mobileStudentFilter).toBe('pending');
  });

  it('can reset immediately after saving before the report query refetches', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const { result } = renderHook(() => useCheckInReport(), { wrapper });

    await waitFor(() => expect(result.current.currentStudents).toHaveLength(3));

    act(() => result.current.handleSaveCheckIn());

    const saveMutationOptions = saveCheckIn.mock.calls[0]?.[1];
    act(() => saveMutationOptions.onSuccess({ id: 'new-report-1' }));
    act(() => result.current.handleResetCheckIn());

    expect(deleteCheckIn).toHaveBeenCalledWith('new-report-1', expect.objectContaining({ onSuccess: expect.any(Function) }));
  });
});
