"use client"

import { useEffect, useState } from 'react';
import getCurrentUser from '@/lib/firebase/auth_state_listener'; // 경로에 맞게 import
import { useRouter } from 'next/navigation'; // 라우팅을 위한 useRouter import

const Page = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter(); // 라우터 객체 생성

  useEffect(() => {
    // 페이지 로드시 현재 로그인 상태 가져오기
    getCurrentUser().then((user) => {
      setUser(user); // user가 로그인 상태일 경우 user 객체, 아니면 null
    });
  }, []);

  const handleLoginRedirect = () => {
    router.push('/login'); // 로그인 페이지로 리디렉션
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