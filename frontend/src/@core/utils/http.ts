// ** React Imports
import { useEffect } from 'react';
import axios from 'axios';
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

// Request interceptor for adding auth token
httpClient.interceptors.request.use(
  (config) => {
    // Only access localStorage in browser environment
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
  }
);

/**
 * Catch the Unauthorized Request
 */
const AxiosInterceptor = ({ children }: any) => {
  // ** Hooks
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const interceptor = httpClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error?.response?.status === 401) {
          // Get the request URL to check if it's a login endpoint
          const requestUrl = error?.config?.url || '';
          const fullUrl = error?.config?.baseURL 
            ? `${error.config.baseURL}${requestUrl}` 
            : requestUrl;
          
          // Check if this is a login endpoint - don't show Swal for login failures
          // Login errors should be handled by the login page itself
          const loginEndpoint = authConfig.loginEndpoint || '';
          const isLoginEndpoint = fullUrl.includes('/auth/login') || 
                                 requestUrl.includes('/auth/login') ||
                                 (loginEndpoint && (fullUrl.includes(loginEndpoint) || requestUrl.includes(loginEndpoint)));
          
          if (!isLoginEndpoint) {
            // Only show Swal for non-login 401 errors (token expired, unauthorized access)
            await Swal.fire({
              title: 'เนื่องจากไม่ได้รับการอนุญาตหรือหมดอายุการใช้งาน',
              text: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
              icon: 'warning',
              showCancelButton: false,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'ตกลง',
            }).then(() => {
              logout();
              router.push('/login');
            });
          }
          // For login endpoint, reject the error so login page can handle it
          return Promise.reject(error);
        } else {
          return Promise.reject(error);
        }
      },
    );

    // Cleanup interceptor on unmount
    return () => {
      httpClient.interceptors.response.eject(interceptor);
    };
  }, [logout, router]);

  return children;
};

export default httpClient;
export { AxiosInterceptor };
