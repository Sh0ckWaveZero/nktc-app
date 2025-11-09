import React, { ReactElement } from 'react';
import {
  BriefcasePlusOutline,
  ChartDonut,
  CogOutline,
  Laptop,
  PencilOutline,
  HumanMaleBoard,
} from 'mdi-material-ui';
import { ThemeColor } from '@/@core/layouts/types';

// ** Constants
export const getUserRoleIcon = (role: string): ReactElement | null => {
  const roleLower = role?.toLowerCase() || '';
  
  switch (roleLower) {
    case 'admin':
      return <Laptop fontSize='small' sx={{ mr: 3, color: 'error.main' }} />;
    case 'author':
      return <CogOutline fontSize='small' sx={{ mr: 3, color: 'warning.main' }} />;
    case 'editor':
      return <PencilOutline fontSize='small' sx={{ mr: 3, color: 'success.main' }} />;
    case 'maintainer':
      return <ChartDonut fontSize='small' sx={{ mr: 3, color: 'primary.main' }} />;
    case 'teacher':
      return <HumanMaleBoard fontSize='small' sx={{ mr: 3, color: 'info.main' }} />;
    default:
      return null;
  }
};

// Keep backward compatibility with object access pattern
export const USER_ROLE_ICONS: Record<string, ReactElement> = {
  get admin() {
    return <Laptop fontSize='small' sx={{ mr: 3, color: 'error.main' }} />;
  },
  get author() {
    return <CogOutline fontSize='small' sx={{ mr: 3, color: 'warning.main' }} />;
  },
  get editor() {
    return <PencilOutline fontSize='small' sx={{ mr: 3, color: 'success.main' }} />;
  },
  get maintainer() {
    return <ChartDonut fontSize='small' sx={{ mr: 3, color: 'primary.main' }} />;
  },
  get teacher() {
    return <HumanMaleBoard fontSize='small' sx={{ mr: 3, color: 'info.main' }} />;
  },
};

export const USER_STATUS_COLORS: Record<string, ThemeColor> = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary',
  true: 'success',
  false: 'secondary',
};

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50];
export const ITEMS_PER_PAGE = 10; // For mobile infinite scroll
export const SEARCH_DEBOUNCE_MS = 200;
export const INFINITE_SCROLL_LOAD_DELAY_MS = 300;

