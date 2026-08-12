import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import CheckInControls from '../CheckInControls';

vi.mock('@/@core/components/mui/date-picker-thai', () => ({
  default: () => <div data-testid='thai-date-picker' />,
}));

const defaultProps = {
  isMobile: false,
  isTablet: false,
  isSmallMobile: false,
  classrooms: [{ id: 'classroom-1', name: 'ปวช.1/1' }],
  defaultClassroom: { id: 'classroom-1', name: 'ปวช.1/1' },
  currentStudentsCount: 2,
  isComplete: true,
  loading: false,
  hasSavedCheckIn: true,
  selectedDate: new Date('2026-08-12T00:00:00+07:00'),
  formSize: 'small' as const,
  inputFontSize: '0.9rem',
  inputPadding: '12px 14px',
  buttonSize: 'small' as const,
  buttonMinWidth: '80px',
  buttonFontSize: '0.875rem',
  onClassroomChange: vi.fn(),
  onDateChange: vi.fn(),
  onSaveCheckIn: vi.fn(),
};

describe('CheckInControls development reset', () => {
  it('does not render Reset when the development flag is disabled', () => {
    render(<CheckInControls {...defaultProps} />);

    expect(screen.queryByRole('button', { name: 'Reset การเช็คชื่อ' })).not.toBeInTheDocument();
  });

  it('confirms before resetting a saved check-in', () => {
    const handleResetCheckIn = vi.fn();

    render(
      <CheckInControls
        {...defaultProps}
        developmentReset={{ isResetting: false, onReset: handleResetCheckIn }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reset การเช็คชื่อ' }));

    expect(screen.getByRole('dialog', { name: 'Reset ข้อมูลการเช็คชื่อ?' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'ยืนยัน Reset' }));

    expect(handleResetCheckIn).toHaveBeenCalledOnce();
  });
});
