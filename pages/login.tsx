import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

import { userService } from '../services';

type FormLogin = {
  username: string;
  password: string;
};

const Login = () => {
  const router = useRouter();

  useEffect(() => {
    // redirect to home if already logged in
    if (userService.userValue) {
      router.push('/');
    }
  }, []);

  // form validation rules 
  const validationSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required')
  });

  const formOptions = { resolver: yupResolver(validationSchema) };

  // get functions to build form with useForm() hook
  const { register, handleSubmit, setError, formState } = useForm<any>(formOptions);
  const { errors } = formState;
  console.log(errors);

  const onSubmit: SubmitHandler<FormLogin> = async ({ username, password }) => {
    try {
      await userService.login(username, password);
      // get return url from query parameters or default to '/'
      const returnUrl: any = router.query.returnUrl || '/';
      router.push(returnUrl);
    } catch (error: any) {
      setError('apiError', { message: error });
    }
  }

  return (
    <div className="h-screen flex">
      <div className="flex w-1/2 bg-gradient-to-tr from-blue-800 to-purple-700 i justify-around items-center">
        <div>
          <h1 className="text-white font-bold text-4xl font-sans">
            <div className="flex row-auto">
              NKTC App
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
          </h1>
          <p className="text-white mt-1">
            ระบบดูแลช่วยเหลือนักเรียนสำหรับวิทยาลัยเทคนิคหนองคาย
          </p>
          <button
            type="submit"
            className="block w-28 bg-white text-indigo-800 mt-4 py-2 rounded-2xl font-bold mb-2"
          >
            อ่านต่อ...
          </button>
        </div>
      </div>
      <div className="flex w-1/2 justify-center items-center bg-white">
        <form className="bg-white" onSubmit={handleSubmit(onSubmit)}>
          <h1 className="text-gray-800 font-bold text-2xl mb-1">
            สวัสดีอีกครั้ง!
          </h1>
          <p className="text-sm font-normal text-gray-600 mb-7">
            ยินดีต้อนรับกลับ
          </p>
          <div className="flex items-center border-2 py-2 px-3 rounded-2xl mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            <input
              className="pl-2 outline-none border-none"
              type="text"
              id="username"
              placeholder="ชื่อผู้ใช้งาน"
              {...register('username')}
            />
          </div>
          <span className="text-red-400">{errors.username?.message ? '* ' + errors.username?.message : ''}</span>
          <div className="flex items-center border-2 py-2 px-3 rounded-2xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                clipRule="evenodd"
              />
            </svg>
            <input
              className="pl-2 outline-none border-none"
              type="password"
              {...register('password')}
              id="password"
              placeholder="รหัสผ่าน"
            />
          </div>
          <span className="text-red-400">{errors.password?.message ? '* ' + errors.password?.message : ''}</span>
          <button
            type="submit"
            className="block w-full bg-indigo-600 mt-4 py-2 rounded-2xl text-white font-semibold mb-2"
          >
            เข้าสู่ระบบ
          </button>
          <span className="text-sm ml-2 hover:text-blue-500 cursor-pointer">
            ลืมรหัสผ่าน?
          </span>
        </form>
      </div>
    </div>
  );
}
export default Login;