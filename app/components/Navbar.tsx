"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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
            ? "rgba(0, 0, 0, 0.8)"
            : isLoaded
            ? "rgba(0, 0, 0, 0)"
            : "rgba(0, 0, 0, 0.8)", // 초기 로딩 시 투명 또는 기본 색상
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
          <h2 className="font-extrabold text-[24px] leading-[30.24px] text-white">
            EmpAI
          </h2>
          <div className="flex gap-4">
            <Image
              src="/search.svg"
              width={24}
              height={24}
              alt="search"
              className="object-contain"
            />
            <Image
              src="/menu.svg"
              width={24}
              height={24}
              alt="menu"
              className="object-contain"
            />
          </div>
        </div>
      </motion.nav>
    </header>
  );
};

export default Navbar;
