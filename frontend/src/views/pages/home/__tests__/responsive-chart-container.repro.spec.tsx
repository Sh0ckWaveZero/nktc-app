import { render } from '@testing-library/react';
import { AreaChart, ResponsiveContainer } from 'recharts';
import { describe, expect, it, vi } from 'vitest';

describe('ResponsiveContainer sizing repro', () => {
  it('uses a fixed height while waiting for the responsive width', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    render(
      <div style={{ width: '100%' }}>
        <ResponsiveContainer width='100%' height={280} minWidth={0}>
          <AreaChart data={[]} />
        </ResponsiveContainer>
      </div>,
    );

    expect(consoleWarnSpy).not.toHaveBeenCalledWith(expect.stringContaining('width(-1) and height(-1)'));
    consoleWarnSpy.mockRestore();
  });
});
