"use client";

import Footer from "@/app/components/Home/Footer2";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import getCurrentUser from "@/lib/firebase/auth_state_listener";
import Image from "next/image";

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("뷰인터 시작");

  useEffect(() => {
    getCurrentUser().then((user) => {
      setUser(user);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 섹션 */}
      <div className="w-full max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">일반 면접</h1>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            이용권 구매
          </button>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex gap-6 mt-8 border-b">
          {["뷰인터 시작", "질문 자정소", "스크립트 관리"].map((tab) => (
            <button
              key={tab}
              className={`pb-2 px-1 ${
                activeTab === tab
                  ? "border-b-2 border-blue-500 text-blue-500 font-semibold"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 메인 컨텐츠 */}
        <div className="mt-8 grid grid-cols-2 gap-8">
          {/* 대화형 면접 연습 */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold">대화형 면접 연습</h2>
              <span className="bg-blue-100 text-blue-500 text-sm px-2 py-1 rounded">
                NEW
              </span>
            </div>
            <ul className="space-y-3 text-gray-600 mb-8">
              <li>• AI면접관과 함께 구조화된 면접 연습</li>
              <li>• 맞춤형 질문 제시하여 실제 면접과 같은 연습 환경</li>
              <li>• 답변 내용을 분석한 AI면접관의 피드백 제공</li>
            </ul>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Image
                    src="menu.svg"
                    alt="Chat"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                  <h3 className="font-semibold">면접 연습 진행 안내</h3>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>마이크 점검</span>
                  <span>→</span>
                  <span>역량 선택</span>
                  <span>→</span>
                  <span>면접 시작</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500 mt-4">
                  <span>대화형 면접 연습</span>
                  <span>→</span>
                  <span>연습 종료</span>
                  <span>→</span>
                  <span>결과 피드백 확인</span>
                </div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-sm">
                <span className="font-semibold">오픈 이벤트</span> 1일 1회 무료 연습 제공
              </div>
              <button className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold">
                연습하기
              </button>
            </div>
          </div>

          {/* 일반형 면접 연습 */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">일반형 면접 연습</h2>
            <ul className="space-y-3 text-gray-600 mb-8">
              <li>• 제시된 면접 질문에 대한 답변 연습</li>
              <li>• 다양한 유형의 면접 질문 및 기출 문제 탐색</li>
              <li>• 면접 역량과 합격 가능성 AI 분석 리포트 제공</li>
            </ul>

            {/* 단일 질문 연습 */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Image
                    src="/menu.svg"
                    alt="Question"
                    width={24}
                    height={24}
                  />
                </div>
                <div>
                  <h3 className="font-semibold">단일 질문 연습</h3>
                  <p className="text-sm text-gray-500">
                    원하는 질문을 선택하여 답변 영상 촬영 및 AI분석
                  </p>
                </div>
              </div>
              <button className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold">
                연습하기
              </button>
            </div>

            {/* 모의 면접 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Image
                    src="/menu.svg"
                    alt="Interview"
                    width={24}
                    height={24}
                  />
                </div>
                <div>
                  <h3 className="font-semibold">모의 면접</h3>
                  <p className="text-sm text-gray-500">
                    실제 기출 면접 질문 3개에 대한 답변 영상 촬영 및 AI분석
                  </p>
                </div>
              </div>
              <button className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold">
                연습하기
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}