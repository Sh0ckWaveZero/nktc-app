import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import CheckInCompletionSummary from '../CheckInCompletionSummary';

describe('CheckInCompletionSummary', () => {
  it('สรุปจำนวนนักเรียนแยกตามสถานะเมื่อเช็คชื่อครบ', () => {
    render(
      <CheckInCompletionSummary
        totalStudents={12}
        hasSavedCheckIn={false}
        counts={{ present: 7, absent: 2, late: 1, leave: 1, internship: 1 }}
      />,
    );

    expect(screen.getByRole('status', { name: 'สรุปการเช็คชื่อครบ 12 คน' })).toBeInTheDocument();
    expect(screen.getByLabelText('มาเรียน 7 คน')).toBeInTheDocument();
    expect(screen.getByLabelText('ขาดเรียน 2 คน')).toBeInTheDocument();
    expect(screen.getByLabelText('มาสาย 1 คน')).toBeInTheDocument();
    expect(screen.getByLabelText('ลา 1 คน')).toBeInTheDocument();
    expect(screen.getByLabelText('ฝึกงาน 1 คน')).toBeInTheDocument();
  });
});
