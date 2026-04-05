const DEFAULT_BACKEND_INTERNAL_URL = 'http://localhost:3001/api';

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const normalizePath = (value: string): string => value.replace(/^\/+/, '');

const INTERNAL_URL = trimTrailingSlash(
  process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_BACKEND_INTERNAL_URL,
);

export const backendServerConfig = {
  internalUrl: INTERNAL_URL,
  url: (path: string, search = ''): string => {
    const pathname = normalizePath(path);
    const queryString = search.startsWith('?') || !search ? search : `?${search}`;

    if (!pathname) {
      return `${INTERNAL_URL}${queryString}`;
    }

    return `${INTERNAL_URL}/${pathname}${queryString}`;
  },
};
