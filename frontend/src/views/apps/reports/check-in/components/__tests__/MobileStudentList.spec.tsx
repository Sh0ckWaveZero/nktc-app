import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('สุ่มนักเรียนและเปิดให้เลือกสถานะเช็คชื่อได้ทันที', () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.75);

    render(<MobileStudentList {...defaultProps} />);

    const randomButton = screen.getByRole('button', { name: 'สุ่มนักเรียนเพื่อเช็คชื่อ' });

    expect(randomButton).toHaveClass('MuiButton-contained', 'MuiButton-colorPrimary');
    fireEvent.click(randomButton);

    const randomStudentRegion = screen.getByRole('region', { name: 'นักเรียนที่สุ่มได้' });

    expect(within(randomStudentRegion).getByText('นางสาวนักเรียน คนที่สอง')).toBeInTheDocument();
    expect(within(randomStudentRegion).getByText('@66002')).toBeInTheDocument();

    fireEvent.click(within(randomStudentRegion).getByRole('button', { name: 'มาสาย' }));

    expect(within(randomStudentRegion).getByRole('button', { name: 'มาสาย' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('เลือกสถานะ มาสาย แล้ว')).toBeInTheDocument();
    expect(defaultProps.onStatusChange).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(199));

    expect(defaultProps.onStatusChange).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));

    expect(defaultProps.onStatusChange).toHaveBeenCalledWith('student-2', 'late');
    expect(screen.getByText('เลือกสถานะ มาสาย แล้ว')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(200));

    expect(screen.queryByText('เลือกสถานะ มาสาย แล้ว')).not.toBeInTheDocument();
  });

  it('ซ่อนปุ่มสุ่มเมื่อเช็คชื่อครบและคงตัวกรองไว้สำหรับดูรายชื่อ', () => {
    render(
      <MobileStudentList
        {...defaultProps}
        pendingStudents={[]}
        paginatedStudents={[]}
        pendingStudentsCount={0}
        filteredStudentsCount={0}
        hasSavedCheckIn
        statusSelections={{ present: students, absent: [], late: [], leave: [], internship: [] }}
      />,
    );

    expect(screen.queryByRole('button', { name: 'สุ่มนักเรียนเพื่อเช็คชื่อ' })).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'กรองรายชื่อนักเรียน' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'สรุปการเช็คชื่อครบ 2 คน' })).toBeInTheDocument();
  });

  it('คำนวณรัศมีปุ่มตัวกรองจากรัศมีกรอบนอกและระยะ inset', () => {
    render(<MobileStudentList {...defaultProps} />);

    const filterGroup = screen.getByRole('group', { name: 'กรองรายชื่อนักเรียน' });
    const pendingFilter = screen.getByRole('button', { name: 'แสดงนักเรียนที่รอเช็คชื่อ' });
    const filterStyle = window.getComputedStyle(filterGroup);

    expect(filterStyle.getPropertyValue('--checkin-filter-inset')).toBe('4px');
    expect(
      Number.parseFloat(filterStyle.getPropertyValue('--checkin-filter-outer-radius')) -
        Number.parseFloat(filterStyle.getPropertyValue('--checkin-filter-inset')),
    ).toBe(4);
    expect(pendingFilter).toHaveStyle({
      borderRadius: 'max(0px, calc(var(--checkin-filter-outer-radius) - var(--checkin-filter-inset)))',
    });
  });
});
