"use client";

import { motion } from "framer-motion";
import { footerVariants } from "@/app/utils/motion";

const Footer = () => (
  <>
  <motion.footer
    variants={footerVariants}
    initial="hidden"
    whileInView="show"
    className="paddings py-8 relative bg-gradient-to-br from-slate-50 to-blue-50"
  >
    <div className="footer-gradient" />
    <div className="innerWidth mx-auto flex flex-col gap-8">      
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
