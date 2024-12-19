"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // useRouter import 추가
import { auth } from '@/lib/firebase/firebase'; 
import { createUserWithEmailAndPassword } from 'firebase/auth'; // 회원가입만 사용
import Link from 'next/link';

export default function Page_Register() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState(''); // 비밀번호 확인 상태 추가
  const [name, setName] = useState('');  // 이름 상태 추가
  const [ageRange, setAgeRange] = useState('');  // 나이대 상태 추가
  const [gender, setGender] = useState('');  // 성별 상태 추가
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    if (pass !== confirmPass) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      router.push('/'); // 회원가입 후 홈으로 리디렉션
    } catch (error: any) {
      setError(error.message);
    }
  };

  // 비밀번호와 비밀번호 확인이 일치할 때만 버튼 활성화
  const isPasswordMatch = pass === confirmPass;
  const isFormValid = email && pass && confirmPass && isPasswordMatch && gender; // 폼이 유효한지 확인

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Link href="/" className="text-blue-500 hover:text-blue-700 mb-4">Go back to home page</Link>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Create an Account</h2>
        {error && (
          <div className="bg-red-100 text-red-600 p-4 mb-4 border border-red-300 rounded-lg">
            <p>{error}</p>
          </div>
        )}
        {/* 이메일 입력 란 */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* 이름 입력 란 */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* 비밀번호 입력 란 */}
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="비밀번호"
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* 비밀번호 확인 입력 란 */}
        <input
          type="password"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
          placeholder="비밀번호 확인"
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* 나이대 선택 콤보박스 */}
        <select
          value={ageRange}
          onChange={(e) => setAgeRange(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="10s">10대</option>
          <option value="20s">20대</option>
          <option value="30s">30대</option>
          <option value="40s">40대</option>
          <option value="50s">50대</option>
          <option value="60s">60대 이상</option>
        </select>

        {/* 성별 선택 버튼 */}
        <div className="flex mb-6 w-full">
          <button
            onClick={() => setGender('male')}
            className={`${
              gender === 'male' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            } px-6 py-3 rounded-l-lg w-full text-center hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
          >
            남자
          </button>
          <button
            onClick={() => setGender('female')}
            className={`${
              gender === 'female' ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700'
            } px-6 py-3 rounded-r-lg w-full text-center hover:bg-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition`}
          >
            여자
          </button>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handleRegister}
            disabled={!isFormValid} // 폼이 유효하지 않으면 비활성화
            className={`w-full py-3 ${isFormValid ? 'bg-blue-500' : 'bg-gray-400'} text-white rounded-lg hover:${isFormValid ? 'bg-blue-700' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}
