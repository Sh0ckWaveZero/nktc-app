// ** React Imports
import { useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Swal from "sweetalert2";
import { useUserStore } from "../../store/apps/user/index";
import { useAuth } from "../../hooks/useAuth";

const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json; charset=UTF-8'
  }
});

/**
 * Catch the AunAuthorized Request
 */
const AxiosInterceptor = ({ children }: any) => {
  // ** Hooks
  const { logout } = useAuth();
  const router = useRouter();
  useEffect(() => {
    httpClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response.status === 401) {
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
        } else {
          return Promise.reject(error);
        }
      },
    );
  }, [router.route]);
  return children;
}

export default httpClient;
export { AxiosInterceptor };