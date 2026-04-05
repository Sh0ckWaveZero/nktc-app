const DEFAULT_API_BASE_PATH = '/api/backend';
const DEFAULT_APP_URL = 'http://localhost:3000';

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const ensureLeadingSlash = (value: string): string => {
  if (!value) {
    return '';
  }

  return value.startsWith('/') ? value : `/${value}`;
};

const normalizeBasePath = (value: string | undefined): string => {
  const trimmedValue = trimTrailingSlash((value || '').trim());

  if (!trimmedValue) {
    return DEFAULT_API_BASE_PATH;
  }

  return ensureLeadingSlash(trimmedValue);
};

const normalizeEndpoint = (value: string): string => {
  if (!value) {
    return '';
  }

  if (value.startsWith('/api/')) {
    return value;
  }

  return ensureLeadingSlash(value);
};

const parseUrl = (value: string): URL | null => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

const API_BASE_PATH = normalizeBasePath(process.env.NEXT_PUBLIC_API_BASE_PATH);
const LEGACY_API_URL = trimTrailingSlash(process.env.NEXT_PUBLIC_API_URL || '');
const APP_URL = trimTrailingSlash(process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL);
const LEGACY_API_ORIGIN = parseUrl(LEGACY_API_URL)?.origin || '';
const APP_ORIGIN = parseUrl(APP_URL)?.origin || '';

const toKnownPath = (value: string): string | null => {
  if (!value) {
    return '';
  }

  if (value.startsWith('/')) {
    return value;
  }

  if (!LEGACY_API_URL) {
    return null;
  }

  if (value.startsWith(LEGACY_API_URL)) {
    return value.slice(LEGACY_API_URL.length) || '';
  }

  const parsedUrl = parseUrl(value);

  if (!parsedUrl) {
    return null;
  }

  if (LEGACY_API_ORIGIN && parsedUrl.origin === LEGACY_API_ORIGIN) {
    return `${parsedUrl.pathname}${parsedUrl.search}`;
  }

  if (APP_ORIGIN && parsedUrl.origin === APP_ORIGIN) {
    return `${parsedUrl.pathname}${parsedUrl.search}`;
  }

  return null;
};

const toEndpointPath = (value: string): string => {
  const knownPath = toKnownPath(value);

  if (knownPath === null) {
    return value;
  }

  if (!knownPath) {
    return '';
  }

  if (knownPath === API_BASE_PATH) {
    return '';
  }

  if (knownPath.startsWith(`${API_BASE_PATH}/`)) {
    return knownPath.slice(API_BASE_PATH.length);
  }

  return normalizeEndpoint(knownPath);
};

const toBrowserPath = (value: string): string => {
  const knownPath = toKnownPath(value);

  if (knownPath === null) {
    return value;
  }

  if (!knownPath) {
    return API_BASE_PATH;
  }

  if (knownPath === API_BASE_PATH || knownPath.startsWith(`${API_BASE_PATH}/`)) {
    return knownPath;
  }

  if (knownPath.startsWith('/api/')) {
    return knownPath;
  }

  return `${API_BASE_PATH}${normalizeEndpoint(knownPath)}`;
};

const toStaticsPath = (value: string): string => {
  if (!value) {
    return '/statics';
  }

  if (value.startsWith('/statics')) {
    return value;
  }

  return `/statics/${value.replace(/^\/+/, '')}`;
};

export const apiConfig = {
  appUrl: APP_URL,
  basePath: API_BASE_PATH,
  educationYears: process.env.NEXT_PUBLIC_EDUCATION_YEARS || '',
  endpoint: (value: string): string => toEndpointPath(value),
  browserUrl: (value: string): string => toBrowserPath(value),
  legacyApiUrl: LEGACY_API_URL,
  staticsEndpoint: (value: string): string => toEndpointPath(toStaticsPath(value)),
  staticsUrl: (value: string): string => toBrowserPath(toStaticsPath(value)),
};
