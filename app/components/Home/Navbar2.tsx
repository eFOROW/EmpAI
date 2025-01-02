"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const Navbar = () => {


  return (
    <header className="bg-white shadow-sm">
      <nav className="py-7">
        <div className="absolute w-[50%] inset-0 pointer-events-none"/>
        <div className="innerWidth mx-auto flex justify-between items-center gap-8 z-10">
          <Link href="/" className="block relative z-10">
            <h2 className="font-extrabold text-[24px] leading-[30.24px] text-primary-black cursor-pointer block">
              EmpAI
            </h2>
          </Link>
          <div className="flex items-center space-x-[100px]">
            {/* 기업탐색 */}
            <div className="nav-item">
              <Link href="/job-search" className="text-primary-black text-lg font-bold">기업탐색</Link>
            </div>

            {/* 자기소개서 */}
            <div className="nav-item relative group">
              <Link href="/self-introduction" className="text-primary-black text-lg font-bold hover:text-blue-600 transition-colors">자기소개서</Link>
              <div className="absolute hidden group-hover:flex flex-col bg-white shadow-lg p-3 rounded-lg min-w-[calc(100%+80px)] left-1/2 transform -translate-x-1/2 z-20 top-[100%] pt-5">
                <Link href="/self-introduction/manage" className="text-gray-700 text-sm hover:text-blue-600 hover:bg-gray-50 p-2 rounded-lg transition-all">자기소개서 관리</Link>
              </div>
            </div>

            {/* AI면접 */}
            <div className="nav-item relative group">
              <Link href="/ai-interview" className="text-primary-black text-lg font-bold hover:text-blue-600 transition-colors">AI면접</Link>
              <div className="absolute hidden group-hover:flex flex-col bg-white shadow-lg p-3 rounded-lg min-w-[calc(100%+100px)] left-1/2 transform -translate-x-1/2 z-20 top-[100%] pt-5">
                <Link href="/ai-interview/question" className="text-gray-700 text-sm hover:text-blue-600 hover:bg-gray-50 p-2 rounded-lg transition-all">AI면접 예상질문</Link>
                <Link href="/ai-interview/evaluation" className="text-gray-700 text-sm hover:text-blue-600 hover:bg-gray-50 p-2 rounded-lg transition-all">AI 모의면접</Link>
                <Link href="/ai-interview/results" className="text-gray-700 text-sm hover:text-blue-600 hover:bg-gray-50 p-2 rounded-lg transition-all">면접결과 보기</Link>
              </div>
            </div>

            {/* 마이페이지 */}
            <div className="nav-item">
              <Link href="/mypage" className="text-primary-black text-lg font-bold">마이페이지</Link>
            </div>
          </div>
        </div>
      </nav>
    </header>

  );
};

export default Navbar;
