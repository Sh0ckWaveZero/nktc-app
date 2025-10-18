'use client';

// ** React Imports
import React, { createContext, useState, useEffect } from 'react';

// ** MUI Imports
import { PaletteMode, Direction } from '@mui/material';

// ** ThemeConfig Import
import themeConfig from '@/configs/themeConfig';

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
  toastPosition?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
};
export type SettingsContextValue = {
  settings: Settings;
  saveSettings: (updatedSettings: Settings) => void;
};

interface SettingsProviderProps {
  children: React.ReactNode;
  pageSettings?: PageSpecificSettings | void;
}

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

const restoreSettings = (): Settings | null => {
  let settings = null;

  if (typeof window !== 'undefined') {
    try {
      const storedData: string | null = window.localStorage.getItem('settings');

      if (storedData) {
        settings = { ...JSON.parse(storedData), ...staticSettings };
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
const storeSettings = (settings: Settings) => {
  if (typeof window !== 'undefined') {
    const initSettings = Object.assign({}, settings);

    delete initSettings.appBar;
    delete initSettings.footer;
    delete initSettings.layout;
    delete initSettings.navHidden;
    delete initSettings.lastLayout;
    delete initSettings.toastPosition;
    window.localStorage.setItem('settings', JSON.stringify(initSettings));
  }
};

// ** Create Context
export const SettingsContext = createContext<SettingsContextValue>({
  saveSettings: () => null,
  settings: initialSettings,
});

export const SettingsProvider = ({ children, pageSettings }: SettingsProviderProps) => {
  // ** State
  const [settings, setSettings] = useState<Settings>({ ...initialSettings });

  useEffect(() => {
    // Only restore settings in browser environment
    if (typeof window !== 'undefined') {
      const restoredSettings = restoreSettings();

      if (restoredSettings) {
        setSettings({ ...restoredSettings });
      }
    }
    if (pageSettings) {
      setSettings({ ...settings, ...pageSettings });
    }
  }, [pageSettings]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (settings.layout === 'horizontal' && settings.skin === 'semi-dark') {
        saveSettings({ ...settings, skin: 'default' });
      }
      if (settings.layout === 'horizontal' && settings.appBar === 'hidden') {
        saveSettings({ ...settings, appBar: 'fixed' });
      }
    }
  }, [settings.layout]);

  const saveSettings = (updatedSettings: Settings) => {
    if (typeof window !== 'undefined') {
      storeSettings(updatedSettings);
    }
    setSettings(updatedSettings);
  };

  return <SettingsContext.Provider value={{ settings, saveSettings }}>{children}</SettingsContext.Provider>;
};

export const SettingsConsumer = SettingsContext.Consumer;
