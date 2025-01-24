"use client";

import { useState } from "react";
import { motion, useDragControls } from "framer-motion";
import Image from "next/image";

const exploreWorlds = [
  {
    id: 'job-search',
    title: '지도기반 기업탐색',
    description: `대전 지역 직종별 채용정보 제공\n집 위치 기준 출퇴근 소요시간 및 거리 분석\n`,
    imageUrl: '/기업탐색.png',
    icon: '🌍', 
    gradientColors: ['#2B32B2', '#1488CC'],
    glowColor: '#1488CC'
  },
  {
    id: 'self-introduction',
    title: 'AI 자소서 분석',
    description: `LLM 기반 자기소개서 맞춤형 첨삭\n유사도 높은 합격 자기소개서 추천\n키워드/문맥 분석으로 작성 방향 제시`,
    imageUrl: '/자소서.png',
    icon: '🤖',
    gradientColors: ['#614385', '#516395'],
    glowColor: '#516395'
  },
  {
    id: 'ai-interview',
    title: 'AI 모의면접',
    description: `자기소개서 기반 맞춤형 면접 질문\n시선/표정/음성 실시간 분석 피드백\n면접관 관점의 답변 평가와 개선점 제시`,
    imageUrl: '/면접.png',
    icon: '🎤',
    gradientColors: ['#834d9b', '#d04ed6'],
    glowColor: '#d04ed6'
  },
  {
    id: 'mypage',
    title: '취업 노트',
    description: `맞춤형 취업 준비 일정 관리\n기업별 지원 현황 및 피드백 기록\n자기소개서/면접 히스토리 저장`,
    imageUrl: '/취업노트.png',
    icon: '📔',
    gradientColors: ['#11998e', '#38ef7d'],
    glowColor: '#38ef7d'
  },
  {
    id: 'community',
    title: '취업 커뮤니티',
    description: `취업 준비생 정보 공유 게시판\n기업 리뷰 및 합격 후기 공유\n업계 선배와의 Q&A 멘토링`,
    imageUrl: '/커뮤니티.png',
    icon: '💬',
    gradientColors: ['#F2994A', '#F2C94C'],
    glowColor: '#F2C94C'
  }
 ];

const Carousel = () => {
 const [[page, direction], setPage] = useState([0, 0]);
 const dragControls = useDragControls();
 const totalPages = exploreWorlds.length;

 const paginate = (newDirection: number) => {
   setPage([page + newDirection, newDirection]);
 };

 const currentIndex = ((page % totalPages) + totalPages) % totalPages;

 return (
   <div className="relative h-[60vh] w-[60%] mx-auto overflow-hidden bg-white/5 backdrop-blur-sm flex items-center justify-center rounded-[40px] border border-white/5">
     <button
       className="absolute left-8 z-50 p-3 rounded-full bg-indigo-300/50 hover:bg-indigo-400/50 transition-all text-white text-xl group shadow-lg border border-white/30"
       onClick={() => paginate(-1)}
     >
       <span className="transform transition-transform group-hover:-translate-x-1">←</span>
     </button>

     <button
       className="absolute right-8 z-50 p-3 rounded-full bg-indigo-300/50 hover:bg-indigo-400/50 transition-all text-white text-xl group shadow-lg border border-white/30"
       onClick={() => paginate(1)}
     >
       <span className="transform transition-transform group-hover:translate-x-1">→</span>
     </button>

     <motion.div
       className="flex items-center justify-center gap-6 absolute h-[420px] left-1/2 -translate-x-1/2"
       drag="x"
       dragConstraints={{ left: 0, right: 0 }}
       dragElastic={0.2}
       onDragEnd={(e, { offset, velocity }) => {
         const swipe = Math.abs(offset.x) * velocity.x;
         if (swipe < -10000) paginate(1);
         if (swipe > 10000) paginate(-1);
       }}
       dragControls={dragControls}
       style={{ cursor: 'grab' }}
     >
       {exploreWorlds.map((world, index) => {
         const position = (index - currentIndex) * 110;
         const scale = index === currentIndex ? 1.0 : 0.7;
         const opacity = index === currentIndex ? 1 : 0.3;

         return (
           <motion.div
             key={world.id}
             className="absolute w-[850px] h-[450px] rounded-[36px] overflow-hidden origin-center"
             animate={{
               x: `${position}%`,
               scale,
               opacity,
               filter: `blur(${index === currentIndex ? 0 : 4}px)`,
               zIndex: index === currentIndex ? 10 : 0,
             }}
             transition={{ type: "spring", stiffness: 85, damping: 20 }}
             style={{
               boxShadow: index === currentIndex ? `0 0 30px -5px ${world.glowColor}40` : 'none'
             }}
           >
             <div 
               className="w-full h-full flex relative group"
               style={{
                 background: `linear-gradient(145deg, ${world.gradientColors[0]}95, ${world.gradientColors[1]}75)`,
               }}
             >
               <div className="absolute inset-0 rounded-[36px] p-[1px] bg-gradient-to-r from-white/20 via-white/40 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.1),transparent_70%)]" />

               <div className="w-[60%] h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />
              <Image
                src={world.imageUrl}
                alt={world.title}
                fill
                sizes="100%"
                className="object-fill"
                priority
                quality={100}
              />
              </div>

               <div className="w-[50%] flex flex-col p-8 text-white">
               <div className="flex items-center gap-4 mb-10">  {/* mb-6 → mb-10 */}
                <span className="text-4xl">{world.icon}</span>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/90 bg-clip-text">{world.title}</h2>
                </div>

                 <div className="flex-1 overflow-y-auto pr-3 space-y-6 my-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                   {world.description.split('\n').map((line, i) => (
                     <p key={i} className="text-lg leading-relaxed font-medium text-white">  {/* font-light → font-medium, opacity 제거 */}
                     {line}
                    </p>
                   ))}
                 </div>

                 <button 
                    className="mt-auto w-full py-3.5 px-6 rounded-xl font-medium relative overflow-hidden group/btn"
                   onClick={() => window.location.href = `/${world.id}`}
                 >
                   <div className="absolute inset-0 backdrop-blur-sm transition-colors group-hover/btn:bg-white/15" />
                   <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500
                     bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.1),transparent_70%)]" />
                   <span className="relative z-10 flex items-center justify-center gap-3">
                     <span>자세히 보기</span>
                     <motion.span
                       animate={{ x: [0, 5, 0] }}
                       transition={{ duration: 1.8, repeat: Infinity }}
                     >
                       →
                     </motion.span>
                   </span>
                 </button>
               </div>
             </div>
           </motion.div>
         );
       })}
     </motion.div>

     <div className="absolute bottom-7 flex gap-4 z-50">
       {exploreWorlds.map((world, index) => (
         <motion.div
           key={index}
           animate={{
             scale: index === currentIndex ? 1.25 : 1,
             backgroundColor: index === currentIndex 
               ? world.glowColor
               : 'rgba(255,255,255,0.3)'
           }}
           className="w-3 h-3 rounded-full transition-all duration-300 shadow-lg border border-gray-800/70 cursor-pointer hover:border-white"
           onClick={() => setPage([index, index > currentIndex ? 1 : -1])}
           style={{
             boxShadow: index === currentIndex 
               ? `0 0 10px ${world.glowColor}60` 
               : '0 0 4px rgba(0,0,0,0.3)'
           }}
         />
       ))}
     </div>
   </div>
 );
};

export default Carousel;