import httpClient from '@/@core/utils/http';
import { authConfig } from '@/configs/auth';
import type { UserDataType } from '@/context/types';

interface LegacySessionResponse {
  data: UserDataType;
  token: string;
  refreshToken: string;
}

/** แลก Better Auth cookie session เป็น JWT เดิมและบันทึกให้ client เดิมใช้งานต่อ */
export const exchangeBetterAuthSession = async (): Promise<UserDataType> => {
  const response = await httpClient.post<LegacySessionResponse>(authConfig.tokenExchangeEndpoint as string);
  const session = response.data;

  window.localStorage.setItem('accessToken', session.token);
  window.localStorage.setItem('refreshToken', session.refreshToken);
  window.localStorage.setItem('userData', JSON.stringify(session));
  return session.data;
};
