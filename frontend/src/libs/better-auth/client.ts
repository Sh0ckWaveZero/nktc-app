'use client';

import { passkeyClient } from '@better-auth/passkey/client';
import { createAuthClient } from 'better-auth/react';
import { twoFactorClient, usernameClient } from 'better-auth/client/plugins';

import { apiConfig } from '@/configs/api';

const origin = typeof window === 'undefined' ? apiConfig.appUrl : window.location.origin;

/** Better Auth client สำหรับ username, TOTP MFA และ Passkey */
export const authClient = createAuthClient({
  baseURL: `${origin}/api/auth/better-auth`,
  plugins: [usernameClient(), twoFactorClient(), passkeyClient()],
});
