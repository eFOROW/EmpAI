"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/firebase";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import Link from "next/link";

export default function Page_Register() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [name, setName] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (pass !== confirmPass) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        pass
      );
      const user = userCredential.user;

      if (!user) {
        throw new Error("회원가입에 실패했습니다.");
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
      const response = await fetch("/api/db/Users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        await deleteUser(user); // 실패 시 사용자 삭제
        setError("회원가입 중 오류가 발생했습니다.");
      } else {
        router.push("/"); // 성공 시 홈 페이지로 이동
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const isPasswordMatch = pass === confirmPass;
  const isFormValid =
    email &&
    pass &&
    confirmPass &&
    isPasswordMatch &&
    name &&
    ageRange &&
    gender;

  return (
    <div className="flex min-h-screen items-start justify-center pt-20 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-4xl font-black text-blue-600 mb-2">회원가입</h2>
            <p className="text-sm text-gray-500">
              서비스 이용을 위해 정보를 입력해주세요
            </p>
          </div>

          {error && (
            <div
              className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg"
              role="alert"
            >
              <p className="font-bold">회원가입 오류</p>
              <p>{error}</p>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister();
            }}
            className="space-y-2"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                이메일
              </label>
              <input
                id="email"
                type="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-blue-100 bg-blue-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
              />
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                이름
              </label>
              <input
                id="name"
                type="text"
                placeholder="이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-blue-100 bg-blue-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-blue-100 bg-blue-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                비밀번호 확인
              </label>
              <input
                id="confirm-password"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-blue-100 bg-blue-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
              />
            </div>

            <div>
              <label
                htmlFor="age-range"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                나이대
              </label>
              <select
                id="age-range"
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-blue-100 bg-blue-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
              >
                <option value="">나이대를 선택하세요</option>
                <option value="10대">10대</option>
                <option value="20대">20대</option>
                <option value="30대">30대</option>
                <option value="40대">40대</option>
                <option value="50대">50대</option>
                <option value="60대 이상">60대 이상</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                성별
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setGender("남자")}
                  className={`flex-1 py-3 rounded-xl transition duration-300 transform hover:scale-105 ${
                    gender === "남자"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 text-blue-600 border-2 border-blue-100"
                  }`}
                >
                  남자
                </button>
                <button
                  type="button"
                  onClick={() => setGender("여자")}
                  className={`flex-1 py-3 rounded-xl transition duration-300 transform hover:scale-105 ${
                    gender === "여자"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 text-blue-600 border-2 border-blue-100"
                  }`}
                >
                  여자
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`
                w-full py-3 rounded-xl text-white font-bold uppercase tracking-wider transition duration-300 transform hover:scale-105
                ${
                  !isFormValid || loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                }
              `}
            >
              {loading ? "회원가입 중..." : "회원가입"}
            </button>

            <div className="text-center text-sm text-gray-600 mt-4">
              <span>이미 계정이 있으신가요? </span>
              <Link
                href="/mypage"
                className="text-blue-600 hover:underline font-medium"
              >
                로그인
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
