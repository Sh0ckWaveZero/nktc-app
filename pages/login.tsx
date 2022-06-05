import { useEffect } from 'react';
import { useRouter, NextRouter } from 'next/router';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { object, string } from 'yup';
import toast, { Toaster } from 'react-hot-toast';
import { getCsrfToken, signIn, useSession } from 'next-auth/react';

export default function Login({ csrfToken }) {
  const { data: session } = useSession();
  // form validation rules 
  const validationSchema = object().shape({
    username: string().required('กรุณาป้อนชื่อผู้ใช้งาน'),
    password: string().required('กรุณาป้อนรหัสผ่าน')
      .min(3, 'รหัสผ่านต้องมีความยาวอย่างน้อย 3 ตัวอักษร')
      .max(100, 'รหัสผ่านต้องมีความยาวมาก 100 ตัวอักษร')
  });

  const formOptions = { resolver: yupResolver(validationSchema) };
  // get functions to build form with useForm() hook
  const { register, handleSubmit, setError, formState } = useForm<any>(formOptions);
  const { errors } = formState;
  const onSubmit: SubmitHandler<any> = async ({ username, password }) => {


    const res = await signIn('credentials', {
      redirect: false,
      username: username,
      password: password,
    });

    console.log("res", res, session);



    // try {
    //   const result: any = await dispatch(signIn({ username, password }));
    //   if (result.meta.requestStatus === 'rejected') {
    //     setError('login', { message: result.error.message });
    //     toast.custom((t) => (
    //       <div>
    //         <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} flex max-w-md w-full justify-between overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800`}>
    //           <div className='flex justify-start'>
    //             <div className="flex items-center justify-center w-12 bg-red-500">
    //               <SvgIcon icon="lightBolt" />
    //             </div>
    //             <div className="px-4 py-2 -mx-3">
    //               <div className="mx-3">
    //                 <span className="font-semibold text-red-500 dark:text-red-400">เกิดข้อผิดพลาด</span>
    //                 <p className="text-sm text-gray-600 dark:text-gray-200">{result.error?.message}</p>
    //               </div>
    //             </div>
    //           </div>
    //           <div className="flex">
    //             <button
    //               onClick={() => toast.dismiss(t.id)}
    //               className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:text-red-500"
    //             >
    //               <SvgIcon icon="close" />
    //             </button>
    //           </div>
    //         </div>
    //       </div>
    //     ))
    //   } else {
    //     const returnUrl: any = router.query.returnUrl || '/';
    //     router.push(returnUrl);
    //   }
    // } catch (error: any) {
    //   setError('apiError', { message: error });
    // }
  }

  return (
    <div className="h-screen bg-white dark:bg-gray-900">
      <div className="flex justify-center h-screen">
        <div className="hidden bg-cover lg:block lg:w-2/3" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1495727034151-8fdc73e332a8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1465&q=80)' }}>
          <div className="flex items-center h-full px-20 bg-gray-900 bg-opacity-40">
            <div>
              <div>
                <h1 className="text-white font-bold text-4xl font-">
                  <div className="flex row-auto">
                    NKTC App
                    {/* <SvgIcon icon="confirm" /> */}
                  </div>
                </h1>
                <p className="text-gray-300 mt-1">
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
          </div>
        </div>
        <div className="flex items-center w-full max-w-md px-6 mx-auto lg:w-2/6">
          {errors.login?.message &&
            <Toaster
              position="top-right"
              reverseOrder={false}
            />
          }
          <div className="flex-1">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-center text-gray-700 dark:text-white">
                NKTC App
              </h2>
              <p className="mt-3 text-gray-500 dark:text-gray-300">ลงชื่อเพื่อเข้าถึงบัญชีของคุณ</p>
            </div>
            <div className="mt-8">
              <form onSubmit={handleSubmit(onSubmit)}>
                <input
                  name="csrfToken"
                  type="hidden"
                  defaultValue={csrfToken}
                />
                <div>
                  <label htmlFor="email" className="block mb-2 text-sm text-gray-600 dark:text-gray-200">ชื่อผู้ใช้งาน</label>
                  <input type="username" id="username" {...register('username')} placeholder="ชื่อผู้ใช้งาน"
                    className="block w-full px-4 py-2 mt-2 mb-3 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-md dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" />
                  <p className="text-xs italic text-red-500">{errors.username?.message ? errors.username?.message : ''} </p>
                </div>
                <div className="mt-6">
                  <div className="flex justify-between mb-2">
                    <label htmlFor="password" className="text-sm text-gray-600 dark:text-gray-200">รหัสผ่าน</label>
                  </div>
                  <input type="password" id="password" {...register('password', { min: 3 })} placeholder="******************"
                    className="block w-full px-4 py-2 mt-2 mb-3 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-md dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" />
                  <p className="text-xs italic text-red-500">{errors.password?.message ? errors.password?.message : ''}</p>
                </div>
                <div className="mt-6">
                  <button type="submit" className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-500 rounded-md hover:bg-blue-400 focus:outline-none focus:bg-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50">
                    เข้าสู่ระบบ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  console.log('getServerSideProps', context);
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}
