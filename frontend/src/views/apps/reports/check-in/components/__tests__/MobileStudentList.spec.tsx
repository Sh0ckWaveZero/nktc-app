import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import MobileStudentList from '../MobileStudentList';

vi.mock('@/@core/components/avatar', () => ({
  default: () => <div data-testid='student-avatar' />,
}));

vi.mock('../MobilePaginationControls', () => ({
  default: () => null,
}));

const students = [
  {
    id: 'student-1',
    studentId: '66001',
    title: 'นาย',
    firstName: 'ทดสอบ',
    lastName: 'ระบบ',
  },
  {
    id: 'student-2',
    studentId: '66002',
    title: 'นางสาว',
    firstName: 'นักเรียน',
    lastName: 'คนที่สอง',
  },
];

const defaultProps = {
  students,
  pendingStudents: students,
  paginatedStudents: students,
  pendingStudentsCount: 2,
  filteredStudentsCount: 2,
  studentFilter: 'pending' as const,
  statusSelections: { present: [], absent: [], late: [], leave: [], internship: [] },
  hasSavedCheckIn: false,
  currentPage: 0,
  totalPages: 1,
  pageSize: 2,
  onFilterChange: vi.fn(),
  onStatusChange: vi.fn(),
  onPageChange: vi.fn(),
};

describe('MobileStudentList', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('สุ่มนักเรียนและเปิดให้เลือกสถานะเช็คชื่อได้ทันที', () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.75);

    render(<MobileStudentList {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'สุ่มนักเรียนเพื่อเช็คชื่อ' }));

    const randomStudentRegion = screen.getByRole('region', { name: 'นักเรียนที่สุ่มได้' });

    expect(within(randomStudentRegion).getByText('นางสาวนักเรียน คนที่สอง')).toBeInTheDocument();
    expect(within(randomStudentRegion).getByText('@66002')).toBeInTheDocument();

    fireEvent.click(within(randomStudentRegion).getByRole('button', { name: 'มาสาย' }));

    expect(within(randomStudentRegion).getByRole('button', { name: 'มาสาย' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('เลือกสถานะ มาสาย แล้ว')).toBeInTheDocument();
    expect(defaultProps.onStatusChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(320);
    });

    expect(defaultProps.onStatusChange).toHaveBeenCalledWith('student-2', 'late');
  });
});
