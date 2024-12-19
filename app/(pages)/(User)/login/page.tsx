"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/firebase'; 
import { signInWithEmailAndPassword } from 'firebase/auth';
import Link from 'next/link';

export default function Page_Login() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      router.push('/');
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Link href="/" className="text-blue-500 hover:text-blue-700 mb-4">Go back to home page</Link>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Log In</h2>
        {error && (
          <div className="bg-red-100 text-red-600 p-4 mb-4 border border-red-300 rounded-lg">
            <p>{error}</p>
          </div>
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="relative w-full mb-6">
      <input
        type={showPassword ? 'text' : 'password'} // showPassword 상태에 따라 타입 변경
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        placeholder="비밀번호"
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {/* 비밀번호 표시 버튼 */}
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)} // 상태 토글
        className="absolute right-3 top-3 text-gray-500 hover:text-blue-500"
      >
        {showPassword ? '숨기기' : '보기'} {/* 버튼 텍스트 */}
      </button>
    </div>
        <div className="flex justify-between items-center">
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}
