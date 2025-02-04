"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";

export default function PageLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        const errorCode = (err as any).code;
        switch (errorCode) {
          case "auth/invalid-credential":
            setError("이메일 또는 비밀번호가 잘못되었습니다.");
            break;
          case "auth/too-many-requests":
            setError(
              "너무 많은 로그인 시도로 계정이 일시적으로 비활성화되었습니다."
            );
            break;
          case "auth/user-not-found":
            setError("존재하지 않는 사용자입니다.");
            break;
          default:
            setError("로그인 중 오류가 발생했습니다.");
        }
      } else {
        setError("로그인 중 알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center pt-20 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-4xl font-black text-blue-600 mb-2">
              Welcome to EmpAI!
            </h2>
            <p className="text-sm text-gray-500">
              로그인하여 서비스를 이용하세요
            </p>
          </div>

          {error && (
            <div
              className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg"
              role="alert"
            >
              <p className="font-bold">로그인 오류</p>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
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
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-blue-100 bg-blue-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`
                w-full py-3 rounded-xl text-white font-bold uppercase tracking-wider transition duration-300 transform hover:scale-105
                ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                }
              `}
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="text-center text-sm text-gray-600 mt-4">
            <span>아직 회원이 아니신가요? </span>
            <Link
              href="/mypage/register"
              className="text-blue-600 hover:underline font-medium"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
