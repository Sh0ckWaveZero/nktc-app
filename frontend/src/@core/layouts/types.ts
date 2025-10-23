import React from 'react';
import { Settings } from '@/@core/context/settingsContext';

export type Layout = 'vertical' | 'horizontal' | 'blank' | 'blankWithAppBar';

export type Skin = 'default' | 'bordered' | 'semi-dark';

export type ContentWidth = 'full' | 'boxed';

export type AppBar = 'fixed' | 'static' | 'hidden';

export type Footer = 'fixed' | 'static' | 'hidden';

export type ThemeColor = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'other';

export type VerticalNavToggle = 'accordion' | 'collapse';

export type HorizontalMenuToggle = 'hover' | 'click';

export type NavLink = {
  icon?: any;
  path?: string;
  title: string;
  action?: string;
  subject?: string;
  disabled?: boolean;
  badgeContent?: string;
  externalLink?: boolean;
  openInNewTab?: boolean;
  badgeColor?: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
};

export type NavGroup = {
  icon?: any;
  title: string;
  action?: string;
  subject?: string;
  badgeContent?: string;
  children?: (NavGroup | NavLink)[];
  badgeColor?: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
};

export type NavSectionTitle = {
  action?: string;
  subject?: string;
  sectionTitle: string;
};

export type VerticalNavItemsType = (NavLink | NavGroup | NavSectionTitle)[];
export type HorizontalNavItemsType = (NavLink | NavGroup)[];

export type LayoutProps = {
  hidden: boolean;
  settings: Settings;
  children: React.ReactNode;
  menuLockedIcon?: React.ReactNode;
  menuUnlockedIcon?: React.ReactNode;
  verticalNavItems?: VerticalNavItemsType;
  scrollToTop?: (props?: any) => React.ReactNode;
  saveSettings: (values: Settings) => void;
  footerContent?: (props?: any) => React.ReactNode;
  horizontalNavItems?: HorizontalNavItemsType;
  verticalAppBarContent?: (props?: any) => React.ReactNode;
  verticalNavMenuContent?: (props?: any) => React.ReactNode;
  verticalNavMenuBranding?: (props?: any) => React.ReactNode;
  horizontalAppBarContent?: (props?: any) => React.ReactNode;
  horizontalAppBarBranding?: (props?: any) => React.ReactNode;
  horizontalNavMenuContent?: (props?: any) => React.ReactNode;
  afterVerticalNavMenuContent?: (props?: any) => React.ReactNode;
  beforeVerticalNavMenuContent?: (props?: any) => React.ReactNode;
};

export type BlankLayoutProps = {
  children: React.ReactNode;
};

export type BlankLayoutWithAppBarProps = {
  children: React.ReactNode;
};

export type AppBarSearchType = {
  id: number;
  url: string;
  icon: string;
  title: string;
  category: string;
};
