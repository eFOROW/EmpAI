"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const Navbar = () => {


  return (
    <header className="bg-white shadow-sm">
      <nav className="py-7">
        <div className="container mx-auto flex items-center">
          {/* 로고 영역: 전체 너비의 30% */}
          <div className="w-[30%]">
            <Link href="/" className="block">
              <h2 className="font-extrabold text-[24px] leading-[30.24px] text-primary-black">
                EmpAI
              </h2>
            </Link>
          </div>
          
          {/* 메뉴 영역: 전체 너비의 60% */}
          <div className="w-[60%] flex items-center justify-end gap-16">
            <div className="nav-item">
              <Link href="/job-search" className="text-primary-black text-lg font-bold">기업탐색</Link>
            </div>
            
            <div className="nav-item relative group">
              <Link href="/self-introduction" className="text-primary-black text-lg font-bold">자기소개서</Link>
              <div className="absolute hidden group-hover:flex flex-col bg-white shadow-lg p-3 rounded-lg min-w-[calc(100%+60px)] left-1/2 transform -translate-x-1/2 z-20 top-[100%] pt-5">
                <Link href="/self-introduction/manage" className="text-gray-700 text-sm hover:text-blue-600 hover:bg-gray-50 p-2 rounded-lg transition-all">자기소개서 관리</Link>
              </div>
            </div>

            <div className="nav-item relative group">
              <Link href="/ai-interview" className="text-primary-black text-lg font-bold">AI면접</Link>
              <div className="absolute hidden group-hover:flex flex-col bg-white shadow-lg p-3 rounded-lg min-w-[calc(100%+90px)] left-1/2 transform -translate-x-1/2 z-20 top-[100%] pt-5">
                <Link href="/ai-interview/question" className="text-gray-700 text-sm hover:text-blue-600 hover:bg-gray-50 p-2 rounded-lg transition-all">AI면접 예상질문</Link>
                <Link href="/ai-interview/evaluation" className="text-gray-700 text-sm hover:text-blue-600 hover:bg-gray-50 p-2 rounded-lg transition-all">AI 모의면접</Link>
                <Link href="/ai-interview/results" className="text-gray-700 text-sm hover:text-blue-600 hover:bg-gray-50 p-2 rounded-lg transition-all">면접결과 보기</Link>
              </div>
            </div>

            <div className="nav-item">
              <Link href="/community" className="text-primary-black text-lg font-bold">커뮤니티</Link>
            </div>

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
