import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import logo from '../../public/static/images/logo.webp'
import { userService } from '@/services/index';
import { useAppDispatch } from '@/store/store';
import { useSelector } from 'react-redux';
import { isAuthenticatedSelector } from '@/store/slices/userSlice';
import { signOut } from '@/store/slices/userSlice';
import { SvgIcon } from '@/components/index';


type Props = {}

export default function Header({ }: Props) {
  const dispatch = useAppDispatch();
  const isLogin = useSelector(isAuthenticatedSelector);
  console.log(isLogin);
  const [user, setUser] = useState(null);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const handlerCloseProfileMenu = (value: boolean) => {
    setShowProfileMenu(value);
  }

  useEffect(() => {
    const subscription = userService.user.subscribe(x => setUser(x));
    return () => subscription.unsubscribe();
  }, []);

  const logout = () => {

    dispatch(signOut());
  }


  return (
    <header className="text-gray-600 body-font">
      <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center ">
        <a className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
          <Image src={logo} width={50} height={50} alt="NKTC-APP Logo" />
          <div className="flex row-auto ml-3 text-xl text-blue-800">
            NKTC App
            <SvgIcon icon="confirm" />
          </div>
        </a>
        <nav className="md:mr-auto md:ml-4 md:py-1 md:pl-4 md:border-l md:border-gray-400	flex flex-wrap items-center text-base justify-center">
          <a className="mr-5 hover:text-gray-900">First Link</a>
          <a className="mr-5 hover:text-gray-900">Second Link</a>
          <a className="mr-5 hover:text-gray-900">Third Link</a>
          <a className="mr-5 hover:text-gray-900">Fourth Link</a>
        </nav>

        <div className="relative inline-block ">
          <button onClick={() => handlerCloseProfileMenu(!showProfileMenu)} className="relative z-10 block p-2 text-gray-700 bg-white border border-transparent rounded-md dark:text-white focus:border-blue-500 focus:ring-opacity-40 dark:focus:ring-opacity-40 focus:ring-blue-300 dark:focus:ring-blue-400 focus:ring dark:bg-gray-800 focus:outline-none">
            <SvgIcon icon="dotMenu" />
          </button>
          <div className={`${showProfileMenu ? 'visible' : 'invisible'} absolute right-0 z-20 w-48 py-2 mt-2 bg-white rounded-md shadow-xl dark:bg-gray-800`}>
            <a href="#" className="flex items-center px-3 py-3 text-sm text-gray-600 capitalize transition-colors duration-200 transform dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white">
              <SvgIcon icon="people" />
              <span className="mx-1">
                view profile
              </span>
            </a>
            <a href="#" className="flex items-center p-3 text-sm text-gray-600 capitalize transition-colors duration-200 transform dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white">
              <SvgIcon icon="setting" />
              <span className="mx-1">
                Settings
              </span>
            </a>
            <a href="#" className="flex items-center p-3 text-sm text-gray-600 capitalize transition-colors duration-200 transform dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white">
              <SvgIcon icon="laptop" />
              <span className="mx-1">
                Keyboard shortcuts
              </span>
            </a>
            <hr className="border-gray-200 dark:border-gray-700 " />
            <a href="#" className="flex items-center p-3 text-sm text-gray-600 capitalize transition-colors duration-200 transform dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white">
              <SvgIcon icon="command" />
              <span className="mx-1">
                Company profile
              </span>
            </a>
            <a href="#" className="flex items-center p-3 text-sm text-gray-600 capitalize transition-colors duration-200 transform dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white">
              <SvgIcon icon="team" />
              <span className="mx-1">Team</span>
            </a>
            <a href="#" className="flex items-center p-3 text-sm text-gray-600 capitalize transition-colors duration-200 transform dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white">
              <SvgIcon icon="peoplePlus" />
              <span className="mx-1">
                Invite colleagues
              </span>
            </a>
            <hr className="border-gray-200 dark:border-gray-700 " />
            <a href="#" className="flex items-center p-3 text-sm text-gray-600 capitalize transition-colors duration-200 transform dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white">
              <SvgIcon icon="help" />
              <span className="mx-1">
                Help
              </span>
            </a>
            <a onClick={logout} className="flex items-center p-3 text-sm text-gray-600 capitalize transition-colors duration-200 transform dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white">
              {isLogin ? <SvgIcon icon={'login'} /> : <SvgIcon icon={'logout'} />}
              <span className="mx-1">
                {isLogin ? 'Sign Out' : 'Sign In'}
              </span>
            </a>
          </div>
        </div>
      </div>
    </header >
  )
}