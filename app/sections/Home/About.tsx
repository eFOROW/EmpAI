"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "../../utils/motion";
import { TypingText } from "../../components/Home";

const About = () => (
  <section className="paddings relative z-10 container mx-auto max-w-[2560px] min-w-[1024px]" id="about">
    <div className="gradient-02 z-0" />
    <motion.div
      variants={staggerContainer(0.25, 0.25)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.25 }}
      className="innerWidth mx-auto flexCenter flex-col"
    >
      <TypingText title="| About EmpAI" textStyles="text-center" />

      <motion.p
        variants={fadeIn("up", "tween", 0.2, 1)}
        className="mt-[8px] font-normal sm:text-[32px] text-[20px] text-center text-secondary-black leading-relaxed tracking-wide"
        style={{ fontFamily: 'Pretendard' }}
      >
        <span className="font-extrabold text-black">EmpAI</span>와 함께라면 취업 준비가 더 쉬워집니다! {" "}
        <span className="font-extrabold text-black">지도로 한눈에 보는 기업 정보</span>부터{" "}
        꼼꼼한 자기소개서 피드백, <span className="font-extrabold text-black">실전같은 AI 모의면접</span>까지,{" "}
        취준생 여러분의 든든한 취업 도우미가 되어드릴게요. 원하는 기업을 쉽게 찾고, 자기소개서도 체계적으로 관리하면서,{" "}
        AI의 맞춤형 피드백으로 면접 실전 감각도 키워보세요. 여러분의 성공적인 취업을 위한 모든 준비, EmpAI가 함께하겠습니다!
      </motion.p>
    </motion.div>
  </section>
);

export default About;
