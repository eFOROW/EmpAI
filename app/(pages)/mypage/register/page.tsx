"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/firebase'; 
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { Footer2 } from '@/app/components/Home';

export default function Page_Register() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [name, setName] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    if (pass !== confirmPass) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      
      if(!user) {
        throw new Error('회원가입에 실패했습니다.')
      }

      // 서버로 데이터 전송
      const newUser = {
        uid: user.uid,
        email: user.email,
        imgUrl: null,
        name,
        ageRange,
        gender,
      };

      // API를 통해 MongoDB에 사용자 데이터 저장
      const response = await fetch('/api/db/Users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        await deleteUser(user); // 실패 시 사용자 삭제
        setError('회원가입 중 오류가 발생했습니다.');
      } else {      
        router.push('/'); // 성공 시 홈 페이지로 이동
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const isPasswordMatch = pass === confirmPass;
  const isFormValid = email && pass && confirmPass && isPasswordMatch && gender;

  return (
    <div className="flex justify-center items-center pt-10 sm:pt-20 relative z-10">
    <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-96">
      <h2 className="text-2xl font-bold text-center mb-6">회원가입</h2>
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
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름"
        className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        placeholder="비밀번호"
        className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="password"
        value={confirmPass}
        onChange={(e) => setConfirmPass(e.target.value)}
        placeholder="비밀번호 확인"
        className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        value={ageRange}
        onChange={(e) => setAgeRange(e.target.value)}
        className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">나이대를 선택하세요</option>
        <option value="10대">10대</option>
        <option value="20대">20대</option>
        <option value="30대">30대</option>
        <option value="40대">40대</option>
        <option value="50대">50대</option>
        <option value="60대 이상">60대 이상</option>
      </select>
      <div className="flex mb-6 w-full">
        <button
          onClick={() => setGender('남자')}
          className={`${
            gender === '남자' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          } px-6 py-3 rounded-l-lg w-full text-center hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
        >
          남자
        </button>
        <button
          onClick={() => setGender('여자')}
          className={`${
            gender === '여자' ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700'
          } px-6 py-3 rounded-r-lg w-full text-center hover:bg-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition`}
        >
          여자
        </button>
      </div>
      <div className="flex justify-between items-center">
        <button
          onClick={handleRegister}
          disabled={!isFormValid}
          className={`w-full py-3 ${isFormValid ? 'bg-blue-500' : 'bg-gray-400'} text-white rounded-lg hover:${isFormValid ? 'bg-blue-700' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          회원가입
        </button>
      </div>
    </div>
  </div>
  );
}
