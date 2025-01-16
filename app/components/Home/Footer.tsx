"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { footerVariants } from "../../utils/motion";
import Link from 'next/link';

const Footer = () => (
  <>
  <motion.footer
    variants={footerVariants}
    initial="hidden"
    whileInView="show"
    className="paddings py-8 relative"
  >
    <div className="footer-gradient" />
    <div className="innerWidth mx-auto flex flex-col gap-8">
      <div className="flex items-center justify-between flex-wrap gap-5">
        <h4 className="font-bold md:text-[50px] text-[44px] text-primary-black">
          EmpAI와 함께
        </h4>
        <Link href="/mypage">
          <button
            type="button"
            className="flex items-center h-fit py-4 px-6 bg-[#2561AB] rounded-[32px] gap-[12px] hover:bg-[#1d4c8c] transition-colors duration-300"
          >
            <Image
              src="/headset.svg"
              width={24}
              height={24}
              alt="headset"
              className="object-contain"
            />
            <span className="font-normal text-[16px] text-white uppercase">
              회원가입
            </span>
          </button>
        </Link>
      </div>
      <div className="flex flex-col">
        <div className="mb-[50px] h-[2px] bg-black opacity-10" />
        <div className="flexCenter flex-wrap gap-8">
          <h4 className="font-extrabold text-[24px] text-primary-black">Employment with AI</h4>
          <p className="font-normal text-[14px] text-primary-black">
            Copyright © 2024 - 2025 EmpAI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </motion.footer>
  </>
);

export default Footer;
