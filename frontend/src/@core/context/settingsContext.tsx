'use client';

// ** React Imports
import React, { createContext, useState, useEffect } from 'react';

// ** MUI Imports
import { PaletteMode, Direction } from '@mui/material';

// ** ThemeConfig Import
import themeConfig from '@/configs/themeConfig';
import { DEFAULT_FONT_SCALE, isFontScale } from '@/@core/utils/font-scale';

import type { FontScale } from '@/@core/utils/font-scale';

// ** Types Import
import { Skin, AppBar, Footer, ThemeColor, ContentWidth, VerticalNavToggle } from '@/@core/layouts/types';

export type Settings = {
  skin: Skin;
  appBar?: AppBar;
  footer?: Footer;
  mode: PaletteMode;
  navHidden?: boolean; // navigation menu
  appBarBlur: boolean;
  direction: Direction;
  navCollapsed: boolean;
  themeColor: ThemeColor;
  contentWidth: ContentWidth;
  layout?: 'vertical' | 'horizontal';
  lastLayout?: 'vertical' | 'horizontal';
  verticalNavToggleType: VerticalNavToggle;
  fontScale: FontScale;
  toastPosition?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
};

export type PageSpecificSettings = {
  skin?: Skin;
  appBar?: AppBar;
  footer?: Footer;
  mode?: PaletteMode;
  navHidden?: boolean; // navigation menu
  appBarBlur?: boolean;
  direction?: Direction;
  navCollapsed?: boolean;
  themeColor?: ThemeColor;
  contentWidth?: ContentWidth;
  layout?: 'vertical' | 'horizontal';
  lastLayout?: 'vertical' | 'horizontal';
  verticalNavToggleType?: VerticalNavToggle;
  fontScale?: FontScale;
  toastPosition?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
};
export type SettingsContextValue = {
  settings: Settings;
  saveSettings: (updatedSettings: Settings) => void;
};

interface SettingsProviderProps {
  children: React.ReactNode;
  pageSettings?: PageSpecificSettings | void;
  storageKey?: string;
}

const DEFAULT_SETTINGS_STORAGE_KEY = 'settings';

const initialSettings: Settings = {
  themeColor: 'primary',
  mode: themeConfig.mode,
  footer: themeConfig.footer,
  layout: themeConfig.layout,
  lastLayout: themeConfig.layout,
  direction: themeConfig.direction,
  navHidden: themeConfig.navHidden,
  appBarBlur: themeConfig.appBarBlur,
  navCollapsed: themeConfig.navCollapsed,
  contentWidth: themeConfig.contentWidth,
  toastPosition: themeConfig.toastPosition,
  verticalNavToggleType: themeConfig.verticalNavToggleType,
  fontScale: DEFAULT_FONT_SCALE,
  skin: themeConfig.layout === 'horizontal' && themeConfig.skin === 'semi-dark' ? 'default' : themeConfig.skin,
  appBar: themeConfig.layout === 'horizontal' && themeConfig.appBar === 'hidden' ? 'fixed' : themeConfig.appBar,
};

const staticSettings = {
  appBar: initialSettings.appBar,
  footer: initialSettings.footer,
  layout: initialSettings.layout,
  navHidden: initialSettings.navHidden,
  lastLayout: initialSettings.lastLayout,
  toastPosition: initialSettings.toastPosition,
};

const restoreSettings = (storageKey: string): Settings | null => {
  let settings = null;

  if (typeof window !== 'undefined') {
    try {
      const storedData: string | null = window.localStorage.getItem(storageKey);

      if (storedData) {
        const storedSettings = JSON.parse(storedData) as Partial<Settings>;

        settings = {
          ...initialSettings,
          ...storedSettings,
          ...staticSettings,
          fontScale: isFontScale(storedSettings.fontScale) ? storedSettings.fontScale : DEFAULT_FONT_SCALE,
        };
      } else {
        settings = initialSettings;
      }
    } catch (err) {
      console.error(err);
    }
  } else {
    settings = initialSettings;
  }

  return settings;
};

// set settings in localStorage
const storeSettings = (settings: Settings, storageKey: string) => {
  if (typeof window !== 'undefined') {
    const initSettings = Object.assign({}, settings);

    delete initSettings.appBar;
    delete initSettings.footer;
    delete initSettings.layout;
    delete initSettings.navHidden;
    delete initSettings.lastLayout;
    delete initSettings.toastPosition;
    window.localStorage.setItem(storageKey, JSON.stringify(initSettings));
  }
};

// ** Create Context
export const SettingsContext = createContext<SettingsContextValue>({
  saveSettings: () => null,
  settings: initialSettings,
});

export const SettingsProvider = ({
  children,
  pageSettings,
  storageKey = DEFAULT_SETTINGS_STORAGE_KEY,
}: SettingsProviderProps) => {
  // ** State
  const [settings, setSettings] = useState<Settings>({ ...initialSettings });

  useEffect(() => {
    // Only restore settings in browser environment
    if (typeof window !== 'undefined') {
      const restoredSettings = restoreSettings(storageKey);

      if (restoredSettings) {
        setSettings({ ...restoredSettings });
      }
    }
    if (pageSettings) {
      setSettings((prev) => ({ ...prev, ...pageSettings }));
    }
  }, [pageSettings, storageKey]);

  const saveSettings = (updatedSettings: Settings) => {
    if (typeof window !== 'undefined') {
      storeSettings(updatedSettings, storageKey);
    }
    setSettings(updatedSettings);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (settings.layout === 'horizontal' && settings.skin === 'semi-dark') {
        saveSettings({ ...settings, skin: 'default' });
      }
      if (settings.layout === 'horizontal' && settings.appBar === 'hidden') {
        saveSettings({ ...settings, appBar: 'fixed' });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.layout]);

  return <SettingsContext.Provider value={{ settings, saveSettings }}>{children}</SettingsContext.Provider>;
};

export const SettingsConsumer = SettingsContext.Consumer;
