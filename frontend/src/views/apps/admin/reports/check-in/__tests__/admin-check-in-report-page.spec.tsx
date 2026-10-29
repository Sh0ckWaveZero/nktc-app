import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { format, parseISO } from 'date-fns';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { queryKeys } from '@/libs/react-query/queryKeys';
import { useAcademicYearStore } from '@/store/academic-year';

import type { ReactElement } from 'react';
import type { ThaiDatePickerProps } from '@/@core/components/mui/date-picker-thai/types';
import type { AcademicCalendarSettings } from '@/types/apps/academic-calendar';
import type { ReportCheckIn } from '@/types/apps/reportCheckIn';
import type { AdminCheckInReportPeriod } from '@/utils/admin-check-in-report';

import AdminCheckInDailyReportPage from '../daily/AdminCheckInDailyReportPage';
import AdminCheckInMonthlyReportPage from '../monthly/AdminCheckInMonthlyReportPage';
import AdminCheckInWeeklyReportPage from '../weekly/AdminCheckInWeeklyReportPage';

const api = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn(), delete: vi.fn() }));
const notifications = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock('@/@core/utils/http', () => ({ default: api }));
vi.mock('react-toastify', () => ({ toast: notifications }));
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

const initialSettings: AcademicCalendarSettings = {
  academicYear: 2569,
  selectedTerm: 1,
  term1Start: '2026-05-13',
  term2Start: '2026-10-28',
  term1Name: 'ภาคเรียนที่ 1/2569',
  term2Name: 'ภาคเรียนพิเศษ 2/2569',
  startWeekOnMonday: true,
};

const pages: Record<AdminCheckInReportPeriod, () => ReactElement> = {
  daily: AdminCheckInDailyReportPage,
  weekly: AdminCheckInWeeklyReportPage,
  monthly: AdminCheckInMonthlyReportPage,
};
let savedSettings: AcademicCalendarSettings | null;

const renderReport = (period: AdminCheckInReportPeriod): QueryClient => {
  const client: QueryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const Page = pages[period];
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

const expectReportRequest = async (start: string, end: string): Promise<void> => {
  await waitFor(() =>
    expect(api.get).toHaveBeenCalledWith(
      `/reportCheckIn/start-date/${start}/end-date/${end}/admin-daily-report`,
      expect.objectContaining({ signal: expect.anything() }),
    ),
  );
};

describe('admin flagpole check-in report academic terms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-05-14T12:00:00+07:00'));
    savedSettings = { ...initialSettings };
    useAcademicYearStore.getState().setScope(2569, 2569, 1);
    api.delete.mockReset();
    api.delete.mockResolvedValue({ data: { deleted: 8 } });
    api.get.mockImplementation(async (url: string) => {
      if (url === '/academic-calendar/settings') return { data: { settings: savedSettings } };
      if (url.startsWith('/reportCheckIn/start-date/')) return { data: { students: 12, checkIn: [] } };
      throw new Error(`Unexpected GET ${url}`);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each(['daily', 'weekly', 'monthly'] as const)(
    'resets the selected whole term from the $period page after confirmation',
    async (period) => {
      const client: QueryClient = renderReport(period);
      const invalidate = vi.spyOn(client, 'invalidateQueries');
      await selectOption('ภาคเรียน', initialSettings.term2Name);
      fireEvent.click(screen.getByRole('button', { name: 'รีเซ็ตข้อมูลภาคเรียนนี้' }));
      const dialog: HTMLElement = await screen.findByRole('dialog');
      expect(dialog).toHaveTextContent('การเช็คชื่อหน้าเสาธงทุกห้องเรียน');
      expect(dialog).toHaveTextContent('ภาคเรียนพิเศษ 2/2569');
      expect(dialog).toHaveTextContent('28 ตุลาคม 2569 - 28 กุมภาพันธ์ 2570');
      expect(api.delete).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button', { name: 'ยืนยันรีเซ็ตข้อมูล' }));
      await waitFor(() =>
        expect(api.delete).toHaveBeenCalledWith('/reportCheckIn/reset-term', { data: { academicYear: 2569, term: 2 } }),
      );
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.checkIn.all });
      expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.statistics.all });
      expect(notifications.success).toHaveBeenCalledWith(expect.stringContaining('8 รายการ'));
    },
  );

  it('allows cancelling without deleting data', async () => {
    renderReport('daily');
    fireEvent.click(await screen.findByRole('button', { name: 'รีเซ็ตข้อมูลภาคเรียนนี้' }));
    expect(await screen.findByRole('dialog')).toHaveTextContent('13 พฤษภาคม 2569 - 13 กันยายน 2569');
    fireEvent.click(screen.getByRole('button', { name: 'ยกเลิก' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(api.delete).not.toHaveBeenCalled();
  });

  it('prevents duplicate resets while a request is pending', async () => {
    let resolveReset: ((value: { data: { deleted: number } }) => void) | undefined;
    api.delete.mockImplementation(
      () =>
        new Promise<{ data: { deleted: number } }>((resolve): void => {
          resolveReset = resolve;
        }),
    );
    renderReport('daily');
    fireEvent.click(await screen.findByRole('button', { name: 'รีเซ็ตข้อมูลภาคเรียนนี้' }));
    fireEvent.click(await screen.findByRole('button', { name: 'ยืนยันรีเซ็ตข้อมูล' }));
    expect(await screen.findByRole('button', { name: 'กำลังดำเนินการ...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'ยกเลิก' })).toBeDisabled();
    await act(async (): Promise<void> => {
      resolveReset?.({ data: { deleted: 8 } });
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(api.delete).toHaveBeenCalledTimes(1);
  });

  it('keeps the confirmation open and shows an error when reset fails', async () => {
    api.delete.mockRejectedValueOnce(new Error('Reset unavailable'));
    renderReport('daily');
    fireEvent.click(await screen.findByRole('button', { name: 'รีเซ็ตข้อมูลภาคเรียนนี้' }));
    fireEvent.click(await screen.findByRole('button', { name: 'ยืนยันรีเซ็ตข้อมูล' }));
    await waitFor(() => expect(notifications.error).toHaveBeenCalledWith('ไม่สามารถรีเซ็ตข้อมูลได้ กรุณาลองอีกครั้ง'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ยืนยันรีเซ็ตข้อมูล' })).toBeEnabled();
  });

  it('disables reset while viewing an archived academic year', async () => {
    useAcademicYearStore.getState().setScope(2569, 2570, 2);
    renderReport('daily');
    expect(await screen.findByRole('button', { name: 'รีเซ็ตข้อมูลภาคเรียนนี้' })).toBeDisabled();
    expect(api.delete).not.toHaveBeenCalled();
  });

  it.each([
    { period: 'daily' as const, start: '2026-05-14', end: '2026-05-14' },
    { period: 'weekly' as const, start: '2026-05-13', end: '2026-05-17' },
    { period: 'monthly' as const, start: '2026-05-13', end: '2026-05-31' },
  ])('connects the $period page to the configured term and opening date', async ({ period, start, end }) => {
    renderReport(period);
    expect(await screen.findByRole('combobox', { name: 'ภาคเรียน' })).toHaveTextContent(initialSettings.term1Name);
    expect(screen.getByText('วันเปิดเทอม 13 พฤษภาคม 2569 · อ้างอิงปฏิทินการศึกษา')).toBeInTheDocument();
    await expectReportRequest(start, end);
    expect(await screen.findByText('ไม่พบข้อมูลการเช็คชื่อในช่วงวันที่เลือก')).toBeInTheDocument();
    expect(api.put).not.toHaveBeenCalled();
  });

  it('defaults to the active calendar term and supports its dates in the next calendar year', async () => {
    savedSettings = { ...initialSettings, selectedTerm: 2 };
    vi.setSystemTime(new Date('2027-01-14T12:00:00+07:00'));
    renderReport('monthly');
    expect(await screen.findByRole('combobox', { name: 'ภาคเรียน' })).toHaveTextContent(initialSettings.term2Name);
    await expectReportRequest('2027-01-01', '2027-01-31');
    expect(screen.getByLabelText('เลือกเดือน')).toHaveAttribute('min', '2026-10-28');
    expect(screen.getByLabelText('เลือกเดือน')).toHaveAttribute('max', '2027-02-28');
  });

  it.each([
    { period: 'daily' as const, end: '2026-10-28' },
    { period: 'weekly' as const, end: '2026-11-01' },
    { period: 'monthly' as const, end: '2026-10-31' },
  ])('switches the $period report to term 2 without changing calendar settings', async ({ period, end }) => {
    renderReport(period);
    await selectOption('ภาคเรียน', initialSettings.term2Name);
    await expectReportRequest('2026-10-28', end);
    expect(screen.getByText('วันเปิดเทอม 28 ตุลาคม 2569 · อ้างอิงปฏิทินการศึกษา')).toBeInTheDocument();
    expect(api.put).not.toHaveBeenCalled();
  });

  it('offers all academic weeks and requests the selected week', async () => {
    renderReport('weekly');
    await selectOption('เลือกสัปดาห์', /สัปดาห์ที่ 18/);
    await expectReportRequest('2026-09-07', '2026-09-13');
    expect(screen.getByRole('combobox', { name: 'เลือกสัปดาห์' })).toHaveTextContent('สัปดาห์ที่ 18');
  });

  it('restricts the date picker and clips a report in the last month', async () => {
    renderReport('monthly');
    const picker: HTMLElement = await screen.findByLabelText('เลือกเดือน');
    expect(picker).toHaveAttribute('min', '2026-05-13');
    expect(picker).toHaveAttribute('max', '2026-09-13');
    fireEvent.change(picker, { target: { value: '2026-09-01' } });
    await expectReportRequest('2026-09-01', '2026-09-13');
  });

  it('uses updated opening dates and week alignment from the shared settings cache', async () => {
    const client: QueryClient = renderReport('weekly');
    await expectReportRequest('2026-05-13', '2026-05-17');
    act((): void => {
      client.setQueryData(queryKeys.academicCalendar.settings(), {
        ...initialSettings,
        term1Start: '2026-05-20',
        startWeekOnMonday: false,
      });
    });
    await expectReportRequest('2026-05-20', '2026-05-26');
    expect(screen.getByText('วันเปิดเทอม 20 พฤษภาคม 2569 · อ้างอิงปฏิทินการศึกษา')).toBeInTheDocument();
  });

  it('links to calendar settings without requesting attendance when no term is configured', async () => {
    savedSettings = null;
    renderReport('daily');
    expect(
      await screen.findByText('กรุณากำหนดภาคเรียนและวันเปิดเทอมในเมนูตั้งค่าระบบก่อนดูรายงาน'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ปฏิทินการศึกษา' })).toHaveAttribute('href', '/apps/calendar');
    expect(api.get).toHaveBeenCalledTimes(1);
  });

  it('shows a retry action when calendar settings cannot be loaded', async () => {
    api.get.mockRejectedValueOnce(new Error('Calendar unavailable'));
    renderReport('daily');
    expect(await screen.findByText('ไม่สามารถโหลดภาคเรียนจากปฏิทินการศึกษาได้')).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'ลองอีกครั้ง' }));
    await expectReportRequest('2026-05-14', '2026-05-14');
  });

  it('shows a retry action when the report request fails', async () => {
    api.get.mockImplementation(async (url: string) => {
      if (url === '/academic-calendar/settings') return { data: { settings: savedSettings } };
      throw new Error('Report unavailable');
    });
    renderReport('daily');
    expect(await screen.findByText('ไม่สามารถโหลดรายงานการเช็คชื่อได้')).toBeInTheDocument();
    api.get.mockResolvedValue({ data: { students: 12, checkIn: [] } });
    fireEvent.click(screen.getByRole('button', { name: 'ลองอีกครั้ง' }));
    expect(await screen.findByText('ไม่พบข้อมูลการเช็คชื่อในช่วงวันที่เลือก')).toBeInTheDocument();
  });

  it('keeps a delayed response from a previous term out of the selected report', async () => {
    let resolvePrevious: ((value: { data: ReportCheckIn }) => void) | undefined;
    api.get.mockImplementation(async (url: string) => {
      if (url === '/academic-calendar/settings') return { data: { settings: savedSettings } };
      if (url.includes('/start-date/2026-05-14/')) {
        return new Promise<{ data: ReportCheckIn }>((resolve): void => {
          resolvePrevious = resolve;
        });
      }
      return { data: { students: 22, checkIn: [] } };
    });
    renderReport('daily');
    await expectReportRequest('2026-05-14', '2026-05-14');
    await selectOption('ภาคเรียน', initialSettings.term2Name);
    expect(await screen.findByText('รายงานสถิติการมาเรียนของนักเรียน ทั้งหมด 22 คน')).toBeInTheDocument();
    await act(async (): Promise<void> => {
      resolvePrevious?.({ data: { students: 99, checkIn: [] } });
    });
    expect(screen.queryByText('รายงานสถิติการมาเรียนของนักเรียน ทั้งหมด 99 คน')).not.toBeInTheDocument();
    expect(screen.getByText('รายงานสถิติการมาเรียนของนักเรียน ทั้งหมด 22 คน')).toBeInTheDocument();
  });
});
