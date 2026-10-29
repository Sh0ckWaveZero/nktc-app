import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { format, parseISO } from 'date-fns';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { queryKeys } from '@/libs/react-query/queryKeys';

import type { ReactElement } from 'react';
import type { ThaiDatePickerProps } from '@/@core/components/mui/date-picker-thai/types';
import type { AcademicCalendarSettings } from '@/types/apps/academic-calendar';
import type { ReportCheckIn } from '@/types/apps/reportCheckIn';
import type { AdminCheckInReportPeriod } from '@/utils/admin-check-in-report';

import AdminActivityCheckInDailyReportPage from '../daily/AdminActivityCheckInDailyReportPage';
import AdminActivityCheckInMonthlyReportPage from '../monthly/AdminActivityCheckInMonthlyReportPage';
import AdminActivityCheckInWeeklyReportPage from '../weekly/AdminActivityCheckInWeeklyReportPage';

const api = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn(), delete: vi.fn() }));
const notifications = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));
const spreadsheet = vi.hoisted(() => ({
  utils: {
    book_new: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
    aoa_to_sheet: vi.fn((data: unknown[][]): unknown[][] => data),
  },
  writeFile: vi.fn(),
}));

vi.mock('@/@core/utils/http', () => ({ default: api }));
vi.mock('react-toastify', () => ({ toast: notifications }));
vi.mock('xlsx', () => spreadsheet);
vi.mock('@/@core/components/mui/date-picker-thai', () => ({
  default: ({ label, value, onChange, minDate, maxDate }: ThaiDatePickerProps): ReactElement => (
    <input
      aria-label={label}
      type='date'
      value={value ? format(value, 'yyyy-MM-dd') : ''}
      min={minDate ? format(minDate, 'yyyy-MM-dd') : undefined}
      max={maxDate ? format(maxDate, 'yyyy-MM-dd') : undefined}
      onChange={(event): void => onChange(event.target.value ? parseISO(event.target.value) : null)}
    />
  ),
}));

const settings: AcademicCalendarSettings = {
  academicYear: 2569,
  selectedTerm: 1,
  term1Start: '2026-05-13',
  term2Start: '2026-10-28',
  term1Name: 'ภาคเรียนที่ 1/2569',
  term2Name: 'ภาคเรียนที่ 2/2569',
  startWeekOnMonday: true,
};
const report: ReportCheckIn = {
  students: 14,
  checkIn: [
    {
      id: 'classroom-1',
      name: 'Classroom 1',
      level: { id: 'level-1', levelName: 'ปวช.', levelFullName: 'Vocational Certificate' },
      department: { id: 'department-1', departmentId: 'D001', name: 'Department 1' },
      present: 12,
      presentPercent: 85.71,
      absent: 2,
      absentPercent: 14.29,
      late: 0,
      latePercent: 0,
      leave: 0,
      leavePercent: 0,
      internship: 0,
      internshipPercent: 0,
      total: 14,
      checkInDate: '2026-05-14T00:00:00.000Z',
      note: 'Activity note',
    },
  ],
};
const pages: Record<AdminCheckInReportPeriod, () => ReactElement> = {
  daily: AdminActivityCheckInDailyReportPage,
  weekly: AdminActivityCheckInWeeklyReportPage,
  monthly: AdminActivityCheckInMonthlyReportPage,
};
let savedSettings: AcademicCalendarSettings | null;

const renderReport = (period: AdminCheckInReportPeriod): QueryClient => {
  const client: QueryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const Page: () => ReactElement = pages[period];
  render(
    <QueryClientProvider client={client}>
      <Page />
    </QueryClientProvider>,
  );
  return client;
};

const selectOption = async (label: string, name: string | RegExp): Promise<void> => {
  fireEvent.mouseDown(await screen.findByRole('combobox', { name: label }));
  fireEvent.click(await screen.findByRole('option', { name }));
};

const expectReportRequest = async (start: string, end: string, activityType: string = 'CLUB'): Promise<void> => {
  await waitFor(() =>
    expect(api.get).toHaveBeenCalledWith(
      `/activity-check-in/start-date/${start}/end-date/${end}/admin-daily-report`,
      expect.objectContaining({ params: { activityType }, signal: expect.anything() }),
    ),
  );
};

describe('admin activity check-in report academic terms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-05-14T12:00:00+07:00'));
    savedSettings = { ...settings };
    api.delete.mockReset();
    api.delete.mockResolvedValue({ data: { deleted: 5 } });
    api.get.mockImplementation(async (url: string) => {
      if (url === '/academic-calendar/settings') return { data: { settings: savedSettings } };
      if (url.startsWith('/activity-check-in/start-date/')) return { data: report };
      throw new Error(`Unexpected GET ${url}`);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each(['daily', 'weekly', 'monthly'] as const)(
    'resets only the selected activity and term from the $period page',
    async (period) => {
      const client: QueryClient = renderReport(period);
      const invalidate = vi.spyOn(client, 'invalidateQueries');
      await selectOption('ประเภทกิจกรรม', 'กิจกรรมลูกเสือ');
      await selectOption('ภาคเรียน', settings.term2Name);
      fireEvent.click(screen.getByRole('button', { name: 'รีเซ็ตข้อมูลภาคเรียนนี้' }));
      const dialog: HTMLElement = await screen.findByRole('dialog');
      expect(dialog).toHaveTextContent('การเช็คชื่อกิจกรรมลูกเสือทุกห้องเรียน');
      expect(dialog).toHaveTextContent('ภาคเรียนที่ 2/2569');
      expect(dialog).toHaveTextContent('28 ตุลาคม 2569 - 28 กุมภาพันธ์ 2570');
      expect(api.delete).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button', { name: 'ยืนยันรีเซ็ตข้อมูล' }));
      await waitFor(() =>
        expect(api.delete).toHaveBeenCalledWith('/activity-check-in/reset-term', {
          data: { academicYear: 2569, term: 2, activityType: 'SCOUT' },
        }),
      );
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.activityCheckIn.all });
      expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.statistics.all });
      expect(notifications.success).toHaveBeenCalledWith(expect.stringContaining('5 รายการ'));
    },
  );

  it.each([
    { period: 'daily' as const, start: '2026-05-14', end: '2026-05-14' },
    { period: 'weekly' as const, start: '2026-05-13', end: '2026-05-17' },
    { period: 'monthly' as const, start: '2026-05-13', end: '2026-05-31' },
  ])(
    'uses calendar term dates for the $period activity report and renders the activity table',
    async ({ period, start, end }) => {
      renderReport(period);
      expect(await screen.findByRole('combobox', { name: 'ภาคเรียน' })).toHaveTextContent(settings.term1Name);
      expect(screen.getByText('วันเปิดเทอม 13 พฤษภาคม 2569 · อ้างอิงปฏิทินการศึกษา')).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: 'ประเภทกิจกรรม' })).toHaveTextContent('กิจกรรมชมรมวิชาชีพ');
      await expectReportRequest(start, end);
      expect(await screen.findByRole('columnheader', { name: 'เข้าร่วม' })).toBeInTheDocument();
      expect(screen.queryByRole('columnheader', { name: 'มาเรียน' })).not.toBeInTheDocument();
    },
  );

  it.each([
    { period: 'daily' as const, end: '2026-10-28' },
    { period: 'weekly' as const, end: '2026-11-01' },
    { period: 'monthly' as const, end: '2026-10-31' },
  ])('switches the $period report term while preserving the selected activity', async ({ period, end }) => {
    renderReport(period);
    await selectOption('ประเภทกิจกรรม', 'กิจกรรมลูกเสือ');
    await selectOption('ภาคเรียน', settings.term2Name);
    await expectReportRequest('2026-10-28', end, 'SCOUT');
    expect(screen.getByRole('combobox', { name: 'ประเภทกิจกรรม' })).toHaveTextContent('กิจกรรมลูกเสือ');
    expect(screen.getByText('วันเปิดเทอม 28 ตุลาคม 2569 · อ้างอิงปฏิทินการศึกษา')).toBeInTheDocument();
    expect(api.put).not.toHaveBeenCalled();
  });

  it('uses the selected academic week when changing the activity filter', async () => {
    renderReport('weekly');
    await selectOption('เลือกสัปดาห์', /สัปดาห์ที่ 18/);
    await expectReportRequest('2026-09-07', '2026-09-13');
    await selectOption('ประเภทกิจกรรม', 'กิจกรรม อวท.');
    await expectReportRequest('2026-09-07', '2026-09-13', 'AST');
    expect(screen.getByRole('combobox', { name: 'เลือกสัปดาห์' })).toHaveTextContent('สัปดาห์ที่ 18');
  });

  it('restricts monthly selection and requests only the days before term end', async () => {
    renderReport('monthly');
    const picker: HTMLElement = await screen.findByLabelText('เลือกเดือน');
    expect(picker).toHaveAttribute('min', '2026-05-13');
    expect(picker).toHaveAttribute('max', '2026-09-13');
    fireEvent.change(picker, { target: { value: '2026-09-01' } });
    await expectReportRequest('2026-09-01', '2026-09-13');
  });

  it('defaults to the active term and handles term 2 across calendar years', async () => {
    savedSettings = { ...settings, selectedTerm: 2 };
    vi.setSystemTime(new Date('2027-01-14T12:00:00+07:00'));
    renderReport('monthly');
    expect(await screen.findByRole('combobox', { name: 'ภาคเรียน' })).toHaveTextContent(settings.term2Name);
    await expectReportRequest('2027-01-01', '2027-01-31');
  });

  it.each(['daily', 'weekly', 'monthly'] as const)(
    'exports the term, opening date and activity in the $period Excel report',
    async (period) => {
      renderReport(period);
      const download: HTMLElement = await screen.findByRole('button', { name: 'ดาวน์โหลด' });
      await waitFor(() => expect(download).toBeEnabled());
      fireEvent.click(download);
      await waitFor(() => expect(spreadsheet.writeFile).toHaveBeenCalled());
      expect(spreadsheet.writeFile).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining(`admin_activity_checkin_${period}_club_`),
      );
      expect(spreadsheet.utils.aoa_to_sheet).toHaveBeenCalledTimes(2);
      for (const [sheet] of spreadsheet.utils.aoa_to_sheet.mock.calls) {
        const text: string = sheet.flat().join(' ');
        expect(text).toContain('ภาคเรียนที่ 1/2569');
        expect(text).toContain('วันเปิดเทอม 13 พฤษภาคม 2569');
        expect(text).toContain('กิจกรรมชมรมวิชาชีพ');
      }
      expect(spreadsheet.utils.aoa_to_sheet.mock.calls[1][0].flat().join(' ')).toContain('Activity note');
    },
  );

  it('does not request activity attendance without calendar settings', async () => {
    savedSettings = null;
    renderReport('daily');
    expect(
      await screen.findByText('กรุณากำหนดภาคเรียนและวันเปิดเทอมในเมนูตั้งค่าระบบก่อนดูรายงาน'),
    ).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledTimes(1);
  });

  it('does not display a delayed response for the previous activity', async () => {
    let resolvePrevious: ((value: { data: ReportCheckIn }) => void) | undefined;
    api.get.mockImplementation(async (url: string, config?: { params?: { activityType: string } }) => {
      if (url === '/academic-calendar/settings') return { data: { settings: savedSettings } };
      if (config?.params?.activityType === 'CLUB') {
        return new Promise<{ data: ReportCheckIn }>((resolve): void => {
          resolvePrevious = resolve;
        });
      }
      return { data: { students: 22, checkIn: [] } };
    });
    renderReport('daily');
    await expectReportRequest('2026-05-14', '2026-05-14');
    await selectOption('ประเภทกิจกรรม', 'กิจกรรม อวท.');
    const currentTitle: string = 'รายงานสถิติการเข้าร่วมกิจกรรม อวท. ของนักเรียน ทั้งหมด 22 คน';
    expect(await screen.findByText(currentTitle)).toBeInTheDocument();
    await act(async (): Promise<void> => {
      resolvePrevious?.({ data: { students: 99, checkIn: [] } });
    });
    expect(screen.getByText(currentTitle)).toBeInTheDocument();
    expect(screen.queryByText(/ทั้งหมด 99 คน/)).not.toBeInTheDocument();
  });
});
