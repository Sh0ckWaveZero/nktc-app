import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ActivateAcademicYearDialog from '../activate-academic-year-dialog';
import CreateAcademicYearDialog from '../create-academic-year-dialog';

describe('academic year setup and confirmation', () => {
  it('requires the exact target year before enabling activation and allows cancellation', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <ActivateAcademicYearDialog
        academicYear={2570}
        activeAcademicYear={2569}
        isSaving={false}
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );
    const confirm = screen.getByRole('button', { name: 'ยืนยันเปิดใช้ปี 2570' });
    expect(confirm).toBeDisabled();
    fireEvent.change(screen.getByLabelText('พิมพ์ 2570 เพื่อยืนยัน'), { target: { value: '2569' } });
    expect(confirm).toBeDisabled();
    fireEvent.change(screen.getByLabelText('พิมพ์ 2570 เพื่อยืนยัน'), { target: { value: '2570' } });
    fireEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'ยกเลิก' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('validates term dates against the academic year and saves a draft calendar', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <CreateAcademicYearDialog
        activeAcademicYear={2569}
        suggestedYear={2570}
        isSaving={false}
        onClose={vi.fn()}
        onSave={onSave}
      />,
    );
    const save = screen.getByRole('button', { name: 'บันทึกปีการศึกษา' });
    fireEvent.click(save);
    expect((await screen.findAllByText('กรุณาระบุวันเปิดภาคเรียน')).length).toBe(2);
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('วันเปิดภาคเรียนที่ 1', { exact: false }), {
      target: { value: '2026-05-17' },
    });
    fireEvent.change(screen.getByLabelText('วันเปิดภาคเรียนที่ 2', { exact: false }), {
      target: { value: '2027-10-25' },
    });
    fireEvent.click(save);
    await screen.findByText('วันเปิดเทอม 1 ต้องอยู่ในปี พ.ศ. ที่ระบุ');
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('วันเปิดภาคเรียนที่ 1', { exact: false }), {
      target: { value: '2027-05-17' },
    });
    fireEvent.click(save);
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        academicYear: 2570,
        selectedTerm: 1,
        term1Start: '2027-05-17',
        term2Start: '2027-10-25',
        term1Name: 'ภาคเรียนที่ 1/2570',
        term2Name: 'ภาคเรียนที่ 2/2570',
        startWeekOnMonday: true,
      }),
    );
  });
});
