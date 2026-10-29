import { describe, expect, it, vi } from 'vitest';

import { createAttendanceSummaryFixture } from '@/test-utils/attendance-summary-fixture';

import { exportAttendanceSummary, formatAttendanceRate, getAttendanceInsights } from '../attendance-summary';

const spreadsheet = vi.hoisted(() => ({
  utils: {
    book_new: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
    aoa_to_sheet: vi.fn((rows: unknown[][]): unknown[][] => rows),
  },
  writeFile: vi.fn(),
}));
vi.mock('xlsx', () => spreadsheet);

describe('attendance summary explanations', () => {
  it('distinguishes a real zero rate from missing observations', () => {
    expect(formatAttendanceRate(0)).toBe('0.00%');
    expect(formatAttendanceRate(null)).toBe('—');
  });
  it('explains counts and changes in percentage points from consecutive weeks', () => {
    const insights = getAttendanceInsights(createAttendanceSummaryFixture());
    expect(insights[0].body).toContain('นักเรียน 12 คน');
    expect(insights[1].body).toContain('เพิ่มขึ้น 20.00 จุดเปอร์เซ็นต์');
    expect(insights[1].body).not.toContain('ยังอาจบันทึกไม่ครบ');
    expect(insights[2].body).toContain('100 ครั้งที่ใช้คำนวณ');
  });
  it('does not compare weeks across a gap without data', () => {
    const data = createAttendanceSummaryFixture();
    data.weekly[1].week = 3;
    expect(getAttendanceInsights(data)[1].body).toContain('ยังไม่มีข้อมูลสองสัปดาห์ต่อเนื่อง');
  });
  it('exports all four views with the actual term, formula and numeric rates', async () => {
    await exportAttendanceSummary(createAttendanceSummaryFixture());
    expect(spreadsheet.utils.book_append_sheet.mock.calls.map((call) => call[2])).toEqual([
      'ภาพรวม',
      'รายสัปดาห์',
      'แผนกวิชา',
      'ห้องเรียน',
    ]);
    expect(spreadsheet.writeFile).toHaveBeenCalledWith(expect.anything(), 'flagpole_summary_2569_term_2.xlsx');
    for (const [rows] of spreadsheet.utils.aoa_to_sheet.mock.calls) {
      const text: string = rows.flat().join(' ');
      expect(text).toContain('ภาคเรียนที่ 2/2569');
      expect(text).toContain('26 ตุลาคม 2569');
      expect(text).toContain('วันที่ไม่มีข้อมูลไม่นับเป็นขาด');
    }
    expect(spreadsheet.utils.aoa_to_sheet.mock.calls[0][0]).toContainEqual([70, 15, 15, 10, 10, 120, 70]);
  });
});
