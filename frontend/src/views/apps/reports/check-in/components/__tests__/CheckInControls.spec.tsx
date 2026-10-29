import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

    expect(screen.queryByText('บันทึกข้อมูลการเช็คชื่อเรียบร้อยแล้ว')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reset การเช็คชื่อ' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'บันทึกการเช็คชื่อ' })).not.toBeInTheDocument();
  });

  it('confirms before resetting a saved check-in', async () => {
    const handleResetCheckIn = vi.fn();

    render(
      <CheckInControls {...defaultProps} developmentReset={{ isResetting: false, onReset: handleResetCheckIn }} />,
    );

    const resetButton = screen.getByRole('button', { name: 'Reset การเช็คชื่อ' });
    const classroomSelectRoot = screen.getByRole('combobox', { name: 'เลือกห้องเรียน' }).closest('.MuiInputBase-root');

    expect(resetButton).toHaveStyle({ width: '176px', height: '44px', borderRadius: '6px' });
    expect(resetButton).toHaveClass('MuiButton-contained', 'MuiButton-colorWarning');
    expect(classroomSelectRoot).toHaveStyle({ height: '44px', borderRadius: '6px' });

    fireEvent.click(resetButton);

    const resetDialog = screen.getByRole('dialog', { name: 'Reset ข้อมูลการเช็คชื่อ?' });
    const resetDialogRoot = document.getElementById('checkin-reset-dialog-root');
    const resetDialogContainer = document.getElementById('checkin-reset-dialog-container');

    expect(resetDialog).toHaveAttribute('id', 'checkin-reset-dialog');
    expect(resetDialog).toHaveAttribute('aria-describedby', 'checkin-reset-dialog-description');
    expect(resetDialogRoot).toHaveStyle({ height: '100dvh' });
    expect(resetDialogContainer).toHaveStyle({
      position: 'absolute',
      inset: '0',
      display: 'grid',
      height: '100%',
    });
    expect(resetDialog).toHaveStyle({
      alignSelf: 'center',
      justifySelf: 'center',
      margin: '0',
      borderRadius: '8px',
    });
    expect(screen.getByRole('button', { name: 'ยกเลิก' })).toHaveFocus();

    fireEvent.click(screen.getByRole('button', { name: 'ยืนยัน Reset' }));

    expect(handleResetCheckIn).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Reset ข้อมูลการเช็คชื่อ?' })).not.toBeInTheDocument();
    });
  });

  it('keeps the reset action full-width with the mobile control height', () => {
    render(<CheckInControls {...defaultProps} isMobile developmentReset={{ isResetting: false, onReset: vi.fn() }} />);

    expect(screen.getByRole('button', { name: 'Reset การเช็คชื่อ' })).toHaveStyle({
      width: '100%',
      height: '48px',
    });
  });
});
