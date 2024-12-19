"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 초기 로딩 상태를 true로 설정
    setIsLoaded(true);

    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          backgroundColor: isScrolled
            ? "rgba(255, 255, 255, 0.2)" // 스크롤 시 화이트 반투명
            : isLoaded
            ? "rgba(255, 255, 255, 0)" // 로딩 완료 시 완전 투명
            : "rgba(255, 255, 255, 0.9)", // 초기 로딩 시 기본 반투명 화이트
        }}
        transition={{
          duration: 0.5,
          ease: "easeInOut",
        }}
        className={`xPaddings py-8 z-50 ${
          isScrolled ? "fixed top-0 left-0 w-full" : "relative"
        }`}
      >
        <div className="absolute w-[50%] inset-0 gradient-01" />
          <div className="innerWidth mx-auto flex justify-between items-center gap-8">
            <h2 className="font-extrabold text-[24px] leading-[30.24px] text-black">
              EmpAI
            </h2>
            <div className="flex items-center space-x-[100px]">
            {/* 기업탐색 */}
            <div className="nav-item">
              <Link href="/" className="text-black text-lg">기업탐색</Link>
            </div>

            {/* 자기소개서 */}
            <div className="nav-item relative group">
              <Link href="/" className="text-black text-lg">자기소개서</Link>
              <div className="absolute hidden group-hover:flex flex-col bg-white/50 p-2 rounded-lg min-w-[calc(100%+50px)] left-1/2 transform -translate-x-1/2">
                <Link href="/" className="text-black text-sm  hover:bg-gray-200 p-2 rounded-lg">자기소개서 관리</Link>
                <Link href="/" className="text-black text-sm  hover:bg-gray-200 p-2 rounded-lg">자기소개서 첨삭</Link>
              </div>
            </div>

            {/* AI면접 */}
            <div className="nav-item relative group">
              <Link href="/" className="text-black text-lg">AI면접</Link>
              <div className="absolute hidden group-hover:flex flex-col bg-white/50 p-2 rounded-lg min-w-[calc(100%+100px)] left-1/2 transform -translate-x-1/2">
                <Link href="/" className="text-black text-sm  hover:bg-gray-200 p-2 rounded-lg">AI면접 예상질문</Link>
                <Link href="/" className="text-black text-sm  hover:bg-gray-200 p-2 rounded-lg">AI 모의면접</Link>
                <Link href="/" className="text-black text-sm  hover:bg-gray-200 p-2 rounded-lg">면접결과 보기</Link>
              </div>
            </div>

            {/* 마이페이지 */}
            <div className="nav-item">
              <a href="/mypage" className="text-black text-lg">
                마이페이지
              </a>
            </div>
          </div>
        </div>
      </motion.nav>
    </header>
  );
};

export default Navbar;
