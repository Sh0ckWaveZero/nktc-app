import { randomUUIDv7 } from "bun";

interface CsrfCookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  domain?: string;
  path?: string;
  maxAge?: number;
}

const CSRF_DEFAULTS = {
  httpOnly: true,
  secure: true,
  sameSite: 'Strict' as const,
  domain: '',
  path: '/',
  maxAge: 7200 // 2 hours
} satisfies Required<CsrfCookieOptions>;

export const generateCsrfToken = async (): Promise<string> => {
  try {
    const randomBytes = await randomUUIDv7();

    return randomBytes;
  } catch (error) {
    console.error('Failed to generate CSRF token:', error);
    throw new Error('CSRF token generation failed');
  }
};

export const setCsrfCookie = (token: string, options: CsrfCookieOptions = {}): string => {
  return `csrf=${token}; ${Object.entries({ ...CSRF_DEFAULTS, ...options }).map(([key, value]) => `${key}=${value}`).join('; ')}`;
};