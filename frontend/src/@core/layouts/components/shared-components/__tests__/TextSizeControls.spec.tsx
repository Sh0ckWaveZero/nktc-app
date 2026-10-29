import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import TextSizeControls from '../TextSizeControls';

const saveSettings = vi.fn();
const settings = {
  fontScale: 1 as const,
};

vi.mock('@/@core/hooks/useSettings', () => ({
  useSettings: () => ({ settings, saveSettings }),
}));

describe('TextSizeControls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('แสดงปุ่มไอคอนเดียวกันทุกขนาดหน้าจอ', () => {
    render(<TextSizeControls />);

    const button = screen.getByRole('button', {
      name: 'เปิดเมนูขนาดตัวอักษร ปัจจุบัน 100 เปอร์เซ็นต์',
    });

    expect(button).toHaveAttribute('id', 'text-size-menu-button');
    expect(button).not.toHaveTextContent('ตัวอักษร 100%');
    expect(button.querySelector('[data-testid="TextFieldsOutlinedIcon"]')).toBeInTheDocument();
  });

  it('แสดงขนาดปัจจุบันเมื่อ Hover ที่ไอคอน', async () => {
    render(<TextSizeControls />);

    fireEvent.mouseOver(screen.getByRole('button', { name: 'เปิดเมนูขนาดตัวอักษร ปัจจุบัน 100 เปอร์เซ็นต์' }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent('ขนาดตัวอักษร 100%');
  });

  it('เปิดเมนูและเลือกขนาดตัวอักษรได้โดยตรง', () => {
    render(<TextSizeControls />);

    fireEvent.click(screen.getByLabelText('เปิดเมนูขนาดตัวอักษร ปัจจุบัน 100 เปอร์เซ็นต์'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'ใหญ่ 112.5%' }));

    expect(saveSettings).toHaveBeenCalledWith({ ...settings, fontScale: 1.125 });
  });
});
