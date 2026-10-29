import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createAttendanceSummaryFixture } from '@/test-utils/attendance-summary-fixture';
import { useAcademicYearStore } from '@/store/academic-year';

import type { ReactElement } from 'react';
import type { AttendanceSummary } from '@/types/apps/attendance-summary';
import type { AttendanceSummaryOptions } from '@/types/apps/attendance-summary-options';

import TermAttendanceSummaryPage from '../term-attendance-summary-page';

const api = vi.hoisted(() => ({ get: vi.fn(), delete: vi.fn() }));
const notifications = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('@/@core/utils/http', () => ({ default: api }));
vi.mock('react-toastify', () => ({ toast: notifications }));
vi.mock('../attendance-weekly-chart', () => ({
  default: (): ReactElement => <div role='img' aria-label='กราฟอัตรามาตรงเวลารายสัปดาห์' />,
}));
vi.mock('../attendance-status-chart', () => ({
  default: (): ReactElement => <div role='img' aria-label='กราฟสัดส่วนสถานะการเช็คชื่อทั้งห้าสถานะ' />,
}));

const options: AttendanceSummaryOptions = {
  currentAcademicYear: 2569,
  currentTerm: 2,
  years: [
    {
      academicYear: 2569,
      terms: [
        { term: 1, name: 'ภาคเรียนที่ 1/2569', startDate: '2026-05-18', endDate: '2026-09-20' },
        { term: 2, name: 'ภาคเรียนที่ 2/2569', startDate: '2026-10-26', endDate: '2027-02-28' },
      ],
    },
    {
      academicYear: 2568,
      terms: [
        { term: 1, name: 'ภาคเรียนที่ 1/2568', startDate: '2025-05-19', endDate: '2025-09-21' },
        { term: 2, name: 'ภาคเรียนที่ 2/2568', startDate: '2025-10-27', endDate: '2026-03-01' },
      ],
    },
  ],
};
interface ApiConfig {
  params?: { academicYear: number; term: 1 | 2 };
}
const renderPage = (): void => {
  const client: QueryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(
    <QueryClientProvider client={client}>
      <TermAttendanceSummaryPage />
    </QueryClientProvider>,
  );
};
const selectOption = async (label: string, name: string): Promise<void> => {
  fireEvent.mouseDown(await screen.findByRole('combobox', { name: label }));
  fireEvent.click(await screen.findByRole('option', { name }));
};
const expectSummaryRequest = async (academicYear: number, term: 1 | 2): Promise<void> => {
  await waitFor(() =>
    expect(api.get).toHaveBeenCalledWith(
      '/attendance-summary/term',
      expect.objectContaining({ params: { academicYear, term }, signal: expect.anything() }),
    ),
  );
};

describe('term attendance dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAcademicYearStore.getState().setScope(2569, 2569, 1);
    api.delete.mockResolvedValue({ data: { deleted: 3 } });
    api.get.mockImplementation(async (url: string, config?: ApiConfig) => {
      if (url === '/attendance-summary/options') return { data: options };
      const data: AttendanceSummary = createAttendanceSummaryFixture();
      const year = options.years.find((item) => item.academicYear === config?.params?.academicYear);
      const term = year?.terms.find((item) => item.term === config?.params?.term);
      if (year && term)
        data.period = {
          ...data.period,
          academicYear: year.academicYear,
          term: term.term,
          name: term.name,
          startDate: term.startDate,
          endDate: term.endDate,
          throughDate: data.period.throughDate < term.endDate ? data.period.throughDate : term.endDate,
        };
      return { data };
    });
  });
  it('shows a reset action for the selected term and refreshes the summary after confirming', async () => {
    renderPage();
    await screen.findByText('70.00%');
    fireEvent.click(screen.getByRole('button', { name: 'รีเซ็ตข้อมูลภาคเรียนนี้' }));
    const dialog: HTMLElement = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('ภาคเรียนที่ 2/2569');
    expect(dialog).toHaveTextContent('26 ตุลาคม 2569 - 28 กุมภาพันธ์ 2570');
    expect(api.delete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันรีเซ็ตข้อมูล' }));
    await waitFor(() =>
      expect(api.delete).toHaveBeenCalledWith('/reportCheckIn/reset-term', { data: { academicYear: 2569, term: 2 } }),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(api.get.mock.calls.filter((call) => call[0] === '/attendance-summary/term')).toHaveLength(2);
    expect(notifications.success).toHaveBeenCalledWith(expect.stringContaining('3 รายการ'));
  });
  it('keeps reset disabled for an archived academic year selected in the summary', async () => {
    renderPage();
    await selectOption('ปีการศึกษา', '2568');
    expect(screen.getByRole('button', { name: 'รีเซ็ตข้อมูลภาคเรียนนี้' })).toBeDisabled();
    expect(api.delete).not.toHaveBeenCalled();
  });
  it('opens the active academic term and shows understandable dashboard metrics', async () => {
    renderPage();
    expect(await screen.findByText('สรุปสถิติหน้าเสาธงรายภาคเรียน')).toBeInTheDocument();
    await expectSummaryRequest(2569, 2);
    expect(await screen.findByText('70.00%')).toBeInTheDocument();
    expect(screen.getByText('12 คน')).toBeInTheDocument();
    expect(screen.getByText('วันที่ไม่มีข้อมูลไม่ถือว่าขาด')).toBeInTheDocument();
    expect(await screen.findByRole('img', { name: 'กราฟอัตรามาตรงเวลารายสัปดาห์' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'ภาคเรียน' })).toHaveTextContent('ภาคเรียนที่ 2/2569');
  });
  it('changes semester and academic year without changing system settings', async () => {
    renderPage();
    await selectOption('ภาคเรียน', 'ภาคเรียนที่ 1/2569');
    await expectSummaryRequest(2569, 1);
    await selectOption('ปีการศึกษา', '2568');
    await expectSummaryRequest(2568, 1);
    expect(screen.getByRole('combobox', { name: 'ภาคเรียน' })).toHaveTextContent('ภาคเรียนที่ 1/2568');
  });
  it('searches classroom data by department', async () => {
    renderPage();
    const table: HTMLElement = await screen.findByRole('table', { name: 'สรุปการเช็คชื่อแยกห้องเรียน' });
    fireEvent.change(screen.getByLabelText('ค้นหาห้องเรียนหรือแผนก'), { target: { value: 'บัญชี' } });
    expect(within(table).getByText('ปวส.1/1')).toBeInTheDocument();
    expect(within(table).queryByText('ปวช.1/1')).not.toBeInTheDocument();
  });
  it('does not fabricate rates or absences for an empty future term', async () => {
    const data: AttendanceSummary = createAttendanceSummaryFixture();
    data.period.hasStarted = false;
    data.totals = { present: 0, absent: 0, late: 0, leave: 0, internship: 0, total: 0, punctualityRate: null };
    data.uniqueStudents = 0;
    data.recordedDays = 0;
    data.classroomsCount = 0;
    api.get.mockImplementation(async (url: string) => ({
      data: url === '/attendance-summary/options' ? options : data,
    }));
    renderPage();
    expect(
      await screen.findByText('ภาคเรียนนี้ยังไม่เริ่ม ระบบจะแสดงสถิติเมื่อมีการเช็คชื่อหลังวันเปิดเทอม'),
    ).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText('0.00%')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ดาวน์โหลดสรุป Excel' })).toBeDisabled();
  });
  it('links to calendar setup when no academic year is configured', async () => {
    api.get.mockResolvedValue({ data: { currentAcademicYear: null, currentTerm: 1, years: [] } });
    renderPage();
    expect(await screen.findByText('กรุณาตั้งค่าปีการศึกษาและวันเปิดเทอมก่อนดูสรุปสถิติ')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ตั้งค่าปฏิทินการศึกษา' })).toHaveAttribute('href', '/apps/calendar');
    expect(api.get).toHaveBeenCalledTimes(1);
  });
  it('allows retrying calendar options after a request error', async () => {
    api.get.mockRejectedValueOnce(new Error('Unavailable'));
    renderPage();
    expect(await screen.findByText('ไม่สามารถโหลดปีการศึกษาจากปฏิทินได้')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'ลองอีกครั้ง' }));
    await expectSummaryRequest(2569, 2);
  });
  it('shows a report error and allows a retry', async () => {
    api.get.mockImplementation(async (url: string) => {
      if (url === '/attendance-summary/options') return { data: options };
      throw new Error('Unavailable');
    });
    renderPage();
    expect(await screen.findByText('ไม่สามารถโหลดสรุปสถิติของภาคเรียนนี้ได้')).toBeInTheDocument();
    api.get.mockResolvedValue({ data: createAttendanceSummaryFixture() });
    fireEvent.click(screen.getByRole('button', { name: 'ลองอีกครั้ง' }));
    expect(await screen.findByText('70.00%')).toBeInTheDocument();
  });
  it('refreshes both calendar options and report data', async () => {
    renderPage();
    await screen.findByText('70.00%');
    fireEvent.click(screen.getByRole('button', { name: 'อัปเดตข้อมูล' }));
    await waitFor(() =>
      expect(api.get.mock.calls.filter((call) => call[0] === '/attendance-summary/options')).toHaveLength(2),
    );
    await waitFor(() =>
      expect(api.get.mock.calls.filter((call) => call[0] === '/attendance-summary/term')).toHaveLength(2),
    );
  });
  it('does not let a delayed response overwrite the newly selected semester', async () => {
    let resolvePrevious: ((value: { data: AttendanceSummary }) => void) | undefined;
    api.get.mockImplementation(async (url: string, config?: ApiConfig) => {
      if (url === '/attendance-summary/options') return { data: options };
      if (config?.params?.term === 2)
        return new Promise<{ data: AttendanceSummary }>((resolve): void => {
          resolvePrevious = resolve;
        });
      return { data: createAttendanceSummaryFixture() };
    });
    renderPage();
    await expectSummaryRequest(2569, 2);
    await selectOption('ภาคเรียน', 'ภาคเรียนที่ 1/2569');
    await screen.findByText('12 คน');
    await act(async (): Promise<void> => {
      resolvePrevious?.({ data: { ...createAttendanceSummaryFixture(), uniqueStudents: 999 } });
    });
    expect(screen.queryByText('999 คน')).not.toBeInTheDocument();
  });
});
