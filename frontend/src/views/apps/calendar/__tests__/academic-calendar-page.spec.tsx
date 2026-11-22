import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  AcademicCalendarSettings,
  CalendarEvent,
  CalendarEventFilters,
  CalendarEventInput,
} from '@/types/apps/academic-calendar';

import AcademicCalendarPage from '../academic-calendar-page';

const api = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));
const notifications = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock('@/@core/utils/http', () => ({ default: api }));
vi.mock('react-toastify', () => ({ toast: notifications }));

const initialSettings: AcademicCalendarSettings = {
  academicYear: 2569,
  selectedTerm: 1,
  term1Start: '2026-05-11',
  term2Start: '2026-10-26',
  term1Name: 'ภาคเรียนที่ 1/2569',
  term2Name: 'ภาคเรียนที่ 2/2569',
  startWeekOnMonday: true,
};

let savedSettings: AcademicCalendarSettings | null;
let events: CalendarEvent[];

const renderPage = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={client}><AcademicCalendarPage /></QueryClientProvider>);
};

describe('AcademicCalendarPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    savedSettings = { ...initialSettings };
    events = [];
    api.get.mockImplementation(async (url: string, config?: { params?: CalendarEventFilters }) => {
      if (url === '/academic-calendar/settings') return { data: { settings: savedSettings } };
      if (url === '/academic-calendar/settings/2568') {
        return {
          data: {
            settings: {
              ...initialSettings,
              academicYear: 2568,
              term1Start: '2025-05-12',
              term2Start: '2025-10-27',
              term1Name: 'ปีเก่าเทอม 1',
              term2Name: 'ปีเก่าเทอม 2',
            },
          },
        };
      }
      if (url.startsWith('/academic-calendar/settings/')) return { data: { settings: null } };
      if (url === '/academic-calendar/events') {
        const filters = config?.params;
        const matches = events.filter((event) =>
          (!filters?.from || event.endDate >= filters.from) &&
          (!filters?.to || event.startDate <= filters.to) &&
          (!filters?.startsFrom || event.startDate >= filters.startsFrom),
        );
        return { data: filters?.limit ? matches.slice(0, filters.limit) : matches };
      }
      throw new Error(`Unexpected GET ${url}`);
    });
    api.post.mockImplementation(async (_url: string, event: CalendarEventInput) => {
      const saved = { ...event, id: 'event-1', description: event.description || null };
      events.push(saved);
      return { data: saved };
    });
    api.put.mockImplementation(async (url: string, data: AcademicCalendarSettings | CalendarEventInput) => {
      if (url === '/academic-calendar/settings') {
        savedSettings = data as AcademicCalendarSettings;
        return { data: savedSettings };
      }
      const event = data as CalendarEventInput;
      const saved = { ...event, id: 'event-1', description: event.description || null };
      events = [saved];
      return { data: saved };
    });
    api.delete.mockImplementation(async () => {
      events = [];
      return { data: { success: true } };
    });
  });

  it('displays the reference term dates and all 18 weekly rows', async () => {
    renderPage();
    expect(await screen.findAllByText('11 พฤษภาคม 2569')).not.toHaveLength(0);
    expect(screen.getByText('23 สิงหาคม 2569')).toBeInTheDocument();
    expect(screen.getByText('13 กันยายน 2569')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /ตารางแจกแจง 18 สัปดาห์/ }));
    expect(within(screen.getByRole('table', { name: 'ตารางสัปดาห์ภาคเรียน' })).getAllByRole('row')).toHaveLength(19);
    expect(screen.getByText('สิ้นสุด ปวส.')).toBeInTheDocument();
    expect(screen.getByText('สิ้นสุด ปวช.')).toBeInTheDocument();
  });

  it('saves both terms and keeps each term name when switching', async () => {
    renderPage();
    await screen.findByRole('button', { name: 'กำหนดวันเปิดเทอม' });
    fireEvent.click(screen.getByRole('button', { name: 'กำหนดวันเปิดเทอม' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/วันเปิดภาคเรียนที่ 2/), { target: { value: '2026-11-02' } });
    fireEvent.click(within(dialog).getByText('เทอม 2/2569'));
    fireEvent.change(within(dialog).getByLabelText(/ชื่อเรียกภาคเรียนปัจจุบัน/), { target: { value: 'ภาคเรียนพิเศษ 2' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'บันทึกการตั้งค่า' }));

    await waitFor(() => expect(api.put).toHaveBeenCalledWith('/academic-calendar/settings', expect.objectContaining({
      selectedTerm: 2,
      term1Start: '2026-05-11',
      term2Start: '2026-11-02',
      term1Name: 'ภาคเรียนที่ 1/2569',
      term2Name: 'ภาคเรียนพิเศษ 2',
    })));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await screen.findAllByText('2 พฤศจิกายน 2569')).not.toHaveLength(0);
  });

  it('loads settings for a previous academic year instead of overwriting them', async () => {
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'กำหนดวันเปิดเทอม' }));
    const dialog = screen.getByRole('dialog');
    const year = within(dialog).getByLabelText('ปีการศึกษา (พ.ศ.)');
    fireEvent.change(year, { target: { value: '2568' } });
    fireEvent.blur(year);
    await waitFor(() => expect(within(dialog).getByLabelText(/วันเปิดภาคเรียนที่ 1/)).toHaveValue('2025-05-12'));
    expect(within(dialog).getByLabelText(/ชื่อเรียกภาคเรียนปัจจุบัน/)).toHaveValue('ปีเก่าเทอม 1');
    fireEvent.click(within(dialog).getByRole('button', { name: 'บันทึกการตั้งค่า' }));
    await waitFor(() => expect(api.put).toHaveBeenCalledWith('/academic-calendar/settings', expect.objectContaining({
      academicYear: 2568,
      term1Name: 'ปีเก่าเทอม 1',
      term2Name: 'ปีเก่าเทอม 2',
    })));
  });

  it('lets an administrator configure both terms when no settings exist yet', async () => {
    savedSettings = null;
    renderPage();
    expect(await screen.findByText(/ยังไม่ได้ตั้งค่าภาคเรียน กรุณา/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'กำหนดวันเปิดเทอม' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByLabelText(/วันเปิดภาคเรียนที่ 1/)).toHaveValue('');
    fireEvent.change(within(dialog).getByLabelText(/วันเปิดภาคเรียนที่ 1/), { target: { value: '2026-05-11' } });
    fireEvent.change(within(dialog).getByLabelText(/วันเปิดภาคเรียนที่ 2/), { target: { value: '2026-10-26' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'บันทึกการตั้งค่า' }));
    await waitFor(() => expect(api.put).toHaveBeenCalledWith('/academic-calendar/settings', expect.objectContaining({
      term1Start: '2026-05-11',
      term2Start: '2026-10-26',
    })));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('rejects reversed term dates and keeps the dialog open on a save error', async () => {
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'กำหนดวันเปิดเทอม' }));
    const dialog = screen.getByRole('dialog');
    const term2 = within(dialog).getByLabelText(/วันเปิดภาคเรียนที่ 2/);
    fireEvent.change(term2, { target: { value: '2026-05-10' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'บันทึกการตั้งค่า' }));
    expect(await within(dialog).findByText('วันเปิดเทอม 2 ต้องหลังวันเปิดเทอม 1')).toBeInTheDocument();
    expect(api.put).not.toHaveBeenCalled();

    api.put.mockRejectedValueOnce(new Error('Network failed'));
    fireEvent.change(term2, { target: { value: '2026-10-26' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'บันทึกการตั้งค่า' }));
    await waitFor(() => expect(notifications.error).toHaveBeenCalledWith('ไม่สามารถบันทึกการตั้งค่าภาคเรียนได้'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('persists quick term switching and navigates to the selected term', async () => {
    renderPage();
    await screen.findByRole('button', { name: 'เทอม 2' });
    fireEvent.click(screen.getByRole('button', { name: 'เทอม 2' }));
    await waitFor(() => expect(api.put).toHaveBeenCalledWith('/academic-calendar/settings', expect.objectContaining({
      selectedTerm: 2,
      term1Start: '2026-05-11',
      term2Start: '2026-10-26',
    })));
    expect(await screen.findAllByText('26 ตุลาคม 2569')).not.toHaveLength(0);
  });

  it('updates the preview and saves when Monday alignment is disabled', async () => {
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'กำหนดวันเปิดเทอม' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/วันเปิดภาคเรียนที่ 1/), { target: { value: '2026-05-13' } });
    fireEvent.click(within(dialog).getByRole('switch', { name: /ปรับให้สัปดาห์เริ่มทุกวันจันทร์/ }));
    expect(await within(dialog).findByText('25 สิงหาคม 2569')).toBeInTheDocument();
    expect(within(dialog).getByText('15 กันยายน 2569')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'บันทึกการตั้งค่า' }));
    await waitFor(() => expect(api.put).toHaveBeenCalledWith('/academic-calendar/settings', expect.objectContaining({
      startWeekOnMonday: false,
      term1Start: '2026-05-13',
    })));
  });

  it('creates, edits, and deletes an event from the selected date', async () => {
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'เพิ่มกิจกรรม' }));
    let dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/ชื่อกิจกรรม/), { target: { value: 'วันปฐมนิเทศ' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'บันทึกกิจกรรม' }));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/academic-calendar/events', expect.objectContaining({
      title: 'วันปฐมนิเทศ',
      startDate: '2026-05-11',
      endDate: '2026-05-11',
    })));
    fireEvent.click(await screen.findByRole('button', { name: 'แก้ไข วันปฐมนิเทศ' }));
    dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/ชื่อกิจกรรม/), { target: { value: 'วันเปิดเรียน' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'บันทึกกิจกรรม' }));
    await waitFor(() => expect(api.put).toHaveBeenCalledWith('/academic-calendar/events/event-1', expect.objectContaining({
      title: 'วันเปิดเรียน',
    })));
    fireEvent.click(await screen.findByRole('button', { name: 'ลบ วันเปิดเรียน' }));
    dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'ลบกิจกรรม' }));
    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/academic-calendar/events/event-1'));
    await waitFor(() => expect(screen.queryByText('วันเปิดเรียน')).not.toBeInTheDocument());
  });

  it('shows an explicit error when calendar settings cannot be loaded', async () => {
    api.get.mockRejectedValue(new Error('Network failed'));
    renderPage();
    expect(await screen.findByText('ไม่สามารถโหลดการตั้งค่าปฏิทินได้')).toBeInTheDocument();
    expect(screen.queryByText(/ยังไม่ได้ตั้งค่าภาคเรียน กรุณา/)).not.toBeInTheDocument();
  });
});
