"use client"

import { useEffect, useState } from 'react';
import { User } from "firebase/auth";
import getCurrentUser from '@/lib/firebase/auth_state_listener';
import { useRouter } from 'next/navigation';

const Page = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then((user) => {
      setUser(user); 
    });
  }, []);

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">자기소개서 관리</h1>
      {user ? (
        <div>
          <p>UID: {user.uid}</p>
          <p>Email: {user.email}</p>
        </div>
      ) : (
        <div className="text-center">
          <p>해당 서비스는 로그인 후 사용 가능합니다.</p>
          <button
            onClick={handleLoginRedirect}
            className="mt-4 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            로그인 하러 가기
          </button>
        </div>
      )}
    </div>
  );
};

export default Page;