import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import StudentCard from '../StudentCard';

vi.mock('@/@core/components/avatar', () => ({
  default: () => <div data-testid='student-avatar' />,
}));

const student = {
  id: 'student-1',
  studentId: '66001',
  title: 'นาย',
  firstName: 'ทดสอบ',
  lastName: 'ระบบ',
  classroom: { name: 'ปวช.1/1' },
};

describe('StudentCard', () => {
  it('ใช้พื้นหลังโปร่งใสเพื่อให้สีของปุ่มสถานะเด่นชัด', () => {
    render(
      <StudentCard
        student={student}
        isPresentCheck={[]}
        isAbsentCheck={[]}
        isLateCheck={[]}
        isLeaveCheck={[]}
        isInternshipCheck={[]}
        hasSavedCheckIn={false}
        onCheckboxChange={vi.fn()}
      />,
    );

    expect(document.querySelector('#checkin-student-card-student-1')).toHaveStyle({
      borderRadius: '8px',
      backgroundColor: 'transparent',
    });
  });

  it('ส่งรหัสนักเรียนและสถานะเมื่อกดปุ่มเช็คชื่อ', () => {
    const handleCheckboxChange = vi.fn();

    render(
      <StudentCard
        student={student}
        isPresentCheck={[]}
        isAbsentCheck={[]}
        isLateCheck={[]}
        isLeaveCheck={[]}
        isInternshipCheck={[]}
        hasSavedCheckIn={false}
        onCheckboxChange={handleCheckboxChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'มาสาย' }));

    expect(handleCheckboxChange).toHaveBeenCalledWith('student-1', 'late');
  });

  it('แสดงไอคอนพร้อมข้อความบนปุ่มสถานะทุกปุ่ม', () => {
    render(
      <StudentCard
        student={student}
        isPresentCheck={[]}
        isAbsentCheck={[]}
        isLateCheck={[]}
        isLeaveCheck={[]}
        isInternshipCheck={[]}
        hasSavedCheckIn={false}
        onCheckboxChange={vi.fn()}
      />,
    );

    ['มาเรียน', 'ขาดเรียน', 'มาสาย', 'ลา', 'ฝึกงาน'].forEach((label) => {
      const button = screen.getByRole('button', { name: label });

      expect(button).toHaveTextContent(label);
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('ปิดการแก้ไขทุกสถานะหลังบันทึกแล้ว', () => {
    render(
      <StudentCard
        student={student}
        isPresentCheck={['student-1']}
        isAbsentCheck={[]}
        isLateCheck={[]}
        isLeaveCheck={[]}
        isInternshipCheck={[]}
        hasSavedCheckIn
        onCheckboxChange={vi.fn()}
      />,
    );

    expect(screen.getAllByRole('button')).toHaveLength(5);
    screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled());
  });
});
