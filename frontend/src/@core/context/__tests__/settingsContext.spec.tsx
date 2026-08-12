import { use } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { SettingsContext, SettingsProvider } from '../settingsContext';

const SettingsReader = () => {
  const { settings, saveSettings } = use(SettingsContext);

  return (
    <>
      <span>font-scale:{settings.fontScale}</span>
      <button type='button' onClick={() => saveSettings({ ...settings, fontScale: 1.25 })}>
        enlarge
      </button>
    </>
  );
};

describe('SettingsProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('อ่านและบันทึกการตั้งค่าด้วย storage key ของผู้ใช้แต่ละคน', async () => {
    window.localStorage.setItem('nktc-settings:user-a', JSON.stringify({ fontScale: 1.125 }));
    window.localStorage.setItem('nktc-settings:user-b', JSON.stringify({ fontScale: 1 }));

    render(
      <SettingsProvider storageKey='nktc-settings:user-a'>
        <SettingsReader />
      </SettingsProvider>,
    );

    await waitFor(() => expect(screen.getByText('font-scale:1.125')).toBeInTheDocument());

    act(() => screen.getByRole('button', { name: 'enlarge' }).click());

    expect(JSON.parse(window.localStorage.getItem('nktc-settings:user-a') ?? '{}')).toMatchObject({ fontScale: 1.25 });
    expect(JSON.parse(window.localStorage.getItem('nktc-settings:user-b') ?? '{}')).toMatchObject({ fontScale: 1 });
  });
});
