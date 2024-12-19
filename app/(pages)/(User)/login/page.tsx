"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // useRouter import 추가
import { auth } from '@/lib/firebase/firebase'; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import Link from 'next/link';

export default function Page_Login() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const router = useRouter(); // useRouter 훅을 사용하여 라우팅

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      router.push('/'); // 로그인 후 홈으로 리디렉션
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      router.push('/'); // 로그인 후 홈으로 리디렉션
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Link href="/" className="text-blue-500 hover:text-blue-700 mb-4">Go back to home page</Link>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Sign In / Sign Up</h2>
        {error && (
          <div className="bg-red-100 text-red-600 p-4 mb-4 border border-red-300 rounded-lg">
            <p>{error}</p>
          </div>
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="Password"
          className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleSignUp}
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create account
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
