"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { slideIn, staggerContainer, textVariant } from "../../utils/motion";
import { useState, useEffect, useMemo } from 'react';

const Hero = () => {
  const [currentText, setCurrentText] = useState('Employment with AI');
  const textLinks = useMemo(() => [
    { text: 'Employment with AI', href: null, linkText: null },
    { text: '자기소개서 피드백', href: '/self-introduction', linkText: '바로 피드백 받기' },
    { text: '지도기반 기업탐색', href: '/job-search', linkText: '기업 찾아보기' },
    { text: '나만의 취업노트', href: null, linkText: null },
    { text: 'AI 모의 면접', href: '/ai-interview', linkText: '면접 연습하기' },
    { text: '취업 커뮤니티', href: null, linkText: null }
  ], []);

  const [showArrow, setShowArrow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const updateText = () => {
      setCurrentText(prev => {
        const currentIndex = textLinks.findIndex(item => item.text === prev);
        return textLinks[(currentIndex + 1) % textLinks.length].text;
      });
    };

    const timer = setInterval(updateText, 6000);
    
    return () => {
      clearInterval(timer);
    };
  }, [textLinks]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const aboutSection = document.getElementById('about');
      
      if (aboutSection) {
        const aboutPosition = aboutSection.offsetTop - 200;
        
        // 페이지 최상단(100px 이내)이거나 about 섹션 이전일 때 화살표 보이기
        if (currentScrollY < 100 || currentScrollY < aboutPosition) {
          setShowArrow(true);
        } else {
          setShowArrow(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    const headerOffset = 200; // 헤더나 다른 요소의 높이에 따라 조절
    if (aboutSection) {
      const elementPosition = aboutSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const currentLink = textLinks.find(item => item.text === currentText);

  return (
    <section className="yPaddings sm:pl-16 pl-6 container mx-auto max-w-[2560px] min-w-[1024px] h-screen">
      <motion.div
        variants={staggerContainer(0.25, 0.25)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.25 }}
        className="innerWidth mx-auto flex flex-col"
      >
        <div className="flexCenter flex-col relative z-10">
          <motion.h1 
            variants={textVariant(0.4)} 
            className="heroHeading relative bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent overflow-hidden"
          >
            EmpAI
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent animate-shine pointer-events-none" />
          </motion.h1>
          <motion.div
            variants={textVariant(0.5)}
            className="flex flex-col items-center justify-center gap-4"
          >
            <motion.div 
              animate={{ 
                y: [50, 0, 0, 50]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.2, 0.8, 1]
              }}
              className="w-full max-w-[750px] h-[3px] bg-gradient-to-r from-primary-black to-transparent" 
            />
            <motion.div 
              animate={{ 
                opacity: [0, 1, 1, 0]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "anticipate",
                times: [0, 0.2, 0.8, 1]
              }}
              className="flex flex-col items-center gap-2"
            >
              <h3 className="heroHeading3 bg-gradient-to-r from-pink-500 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient">
                {currentText}
              </h3>
            </motion.div>
            <motion.div 
              animate={{ 
                y: [-50, 0, 0, -50]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "linear",
                times: [0, 0.2, 0.8, 1]
              }}
              className="w-full max-w-[750px] h-[3px] bg-gradient-to-r from-transparent to-primary-black" 
            />
            <AnimatePresence mode="wait">
              {currentLink?.href && (
                <motion.div
                  key={currentLink.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Link 
                    href={currentLink.href}
                    className="mt-10 text-lg font-base text-white inline-flex justify-center items-center border-2 rounded-full px-6 py-2 max-w-[200px] mx-auto bg-gradient-to-r from-pink-500 via-blue-500 to-purple-600 border-transparent animate-gradient"
                  >
                    {currentLink.linkText}
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        <div className="w-full sm:h-[300px] h-[350px] object-cover rounded-tl-[140px] z-10 relative"></div>
      </motion.div>
      <motion.div 
        className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer z-10 transition-opacity duration-300 ${showArrow ? 'opacity-100' : 'opacity-0'}`}
        animate={{ 
          y: [0, 10, 0]
        }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        onClick={scrollToAbout}
      >
        <div className="flex flex-col items-center gap-1 p-4">
          <span className="text-2xl transform rotate-90 hover:text-purple-400 transition-colors w-12 h-12 flex items-center justify-center">
            &#10095;&#10095;
          </span>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;