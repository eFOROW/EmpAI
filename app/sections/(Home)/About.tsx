"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { TypingText } from "../../components/(Home)";
import { fadeIn, staggerContainer } from "../../utils/motion";

const About = () => (
  <section className="paddings relative z-10">
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
  className="mt-[8px] font-normal sm:text-[32px] text-[20px] text-center text-secondary-black"
>
  <span className="font-extrabold text-black">EmpAI</span>는 구직자들에게 스마트한 취업 준비를 돕기 위해 
  <span className="font-extrabold text-black"> 지도 기반 기업 탐색 자기소개서 관리 & 피드백</span>, 
  AI 면접 예상 질문 생성, <span className="font-extrabold text-black">AI 모의 면접 & 피드백</span> 등 
  다양한 기능을 제공합니다. 이를 통해 사용자는 원하는 기업을 쉽게 찾고, 자기소개서를 체계적으로 관리하며, 면접 준비를 철저히 할 수 있습니다. AI가 제공하는 맞춤형 피드백을 통해 면접에 필요한 실전 경험을 쌓고, 취업 준비를 더욱 효과적으로 할 수 있는 기회를 제공합니다.
</motion.p>
      <motion.div variants={fadeIn("up", "tween", 0.3, 1)}>
        <Link href="#explore">
          <Image
            src="/arrow-down.svg"
            width={18}
            height={28}
            alt="arrow down"
            className="object-contain mt-[28px]"
          />
        </Link>
      </motion.div>
    </motion.div>
  </section>
);

export default About;
