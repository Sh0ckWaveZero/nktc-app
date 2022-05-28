import { resetUsername, userSelector } from "@/store/slices/userSlice";
import React from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store/index";


export default function Dashboard() {
  const userData = useSelector(userSelector);
  const dispatch = useAppDispatch();

  return (
    <div className="h-screen">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96"  >
              <p className=" text-black-700 p-5">
                {userData.username}
              </p>
              <button className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
                onClick={() => { dispatch(resetUsername({ username: 'Na is Handsome guy!', accessToken: 'reset' })) }}>Reset</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
