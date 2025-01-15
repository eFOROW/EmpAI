"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { slideIn, staggerContainer, textVariant } from "../../utils/motion";
import { useState, useEffect, useMemo } from 'react';

const Hero = () => {
  const [currentText, setCurrentText] = useState('Employment with AI');
  const textLinks = useMemo(() => [
    { text: 'Employment with AI', href: null, linkText: null },
    { text: '자기소개서 피드백', href: '/self-introduction', linkText: '바로 피드백 받기' },
    { text: '지도기반 기업탐색', href: '/job-search', linkText: '당장 찾아보기' },
    { text: 'AI 모의 면접', href: '/ai-interview', linkText: '면접 시작하기' },
    { text: '나만의 취업노트', href: '/mypage', linkText: '노트 작성하기' }
  ], []);

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

  const currentLink = textLinks.find(item => item.text === currentText);

  return (
    <section className="yPaddings sm:pl-16 pl-6">
      <motion.div
        variants={staggerContainer(0.25, 0.25)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.25 }}
        className="innerWidth mx-auto flex flex-col"
      >
        <div className="flexCenter flex-col relative z-10">
          <motion.h1 variants={textVariant(1.1)} className="heroHeading">
            EmpAI
          </motion.h1>
          <motion.div
            variants={textVariant(1.2)}
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
                ease: "linear",
                times: [0, 0.2, 0.8, 1]
              }}
              className="flex flex-col items-center gap-2"
            >
              <h3 className="heroHeading3">
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
          {currentLink?.href && (
            <Link 
              href={currentLink.href}
              className="text-purple-500 mt-10 text-lg font-base hover:text-white transition-colors inline-flex justify-center items-center border-2 border-purple-400 rounded-full px-6 py-2 hover:bg-purple-400 max-w-[200px] mx-auto"
            >
              {currentLink.linkText}
            </Link>
          )}
          </motion.div>
        </div>
        <div className="w-full sm:h-[300px] h-[300px] object-cover rounded-tl-[140px] z-10 relative"></div>
      </motion.div>
    </section>
  );
};

export default Hero;
