// ** React Imports
import { useEffect } from 'react';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useAuth } from '../../hooks/useAuth';
import { authConfig } from '@/configs/auth';

const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=UTF-8',
  },
});

// Module-scope flags for refresh token handling
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Request interceptor for adding auth token
httpClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = window.localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const clearAuthAndRedirect = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('accessToken');
    window.localStorage.removeItem('refreshToken');
    window.localStorage.removeItem('userData');
    window.location.href = '/login';
  }
};

/**
 * Catch the Unauthorized Request
 */
const AxiosInterceptor = ({ children }: any) => {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const interceptor = httpClient.interceptors.response.use(
      (response) => {
        // Extract data from wrapped response: { success, statusCode, message, data, meta }
        // But don't extract if there are other important fields like token, refreshToken at top level
        if (
          response.data &&
          typeof response.data === 'object' &&
          'data' in response.data &&
          'success' in response.data &&
          !('token' in response.data) &&
          !('refreshToken' in response.data)
        ) {
          response.data = response.data.data;
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error?.response?.status === 401) {
          const requestUrl = originalRequest?.url || '';
          const fullUrl = originalRequest?.baseURL ? `${originalRequest.baseURL}${requestUrl}` : requestUrl;

          const loginEndpoint = authConfig.loginEndpoint || '';
          const isLoginEndpoint =
            fullUrl.includes('/auth/login') ||
            requestUrl.includes('/auth/login') ||
            (loginEndpoint && (fullUrl.includes(loginEndpoint) || requestUrl.includes(loginEndpoint)));

          const isMeEndpoint = fullUrl.includes('/auth/me') || requestUrl.includes('/auth/me');
          const isRefreshEndpoint = fullUrl.includes('/auth/refresh') || requestUrl.includes('/auth/refresh');

          // For login, me, and refresh endpoints - just reject, don't try to refresh
          if (isLoginEndpoint || isMeEndpoint || isRefreshEndpoint) {
            return Promise.reject(error);
          }

          // If already retried, clear auth and redirect
          if (originalRequest._retry) {
            clearAuthAndRedirect();
            return Promise.reject(error);
          }

          originalRequest._retry = true;

          // If refresh is already in progress, queue this request
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return httpClient(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          isRefreshing = true;

          const refreshToken = typeof window !== 'undefined' ? window.localStorage.getItem('refreshToken') : null;

          if (!refreshToken) {
            isRefreshing = false;
            clearAuthAndRedirect();
            return Promise.reject(error);
          }

          try {
            const response = await httpClient.post(authConfig.refreshEndpoint as string, {
              refreshToken,
            });

            const newToken = response.data?.token;

            if (typeof window !== 'undefined') {
              window.localStorage.setItem('accessToken', newToken);
            }

            processQueue(null, newToken);

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return httpClient(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            clearAuthAndRedirect();
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }

        // For other errors (not 401)
        if (error?.response?.status === 403) {
          await Swal.fire({
            title: 'ไม่มีสิทธิ์เข้าถึง',
            text: 'คุณไม่มีสิทธิ์ในการเข้าถึงส่วนนี้',
            icon: 'warning',
            confirmButtonText: 'ตกลง',
          });
        }

        return Promise.reject(error);
      },
    );

    return () => {
      httpClient.interceptors.response.eject(interceptor);
    };
  }, [logout, router]);

  return children;
};

export default httpClient;
export { AxiosInterceptor };
