"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TitleText, ExploreCard, TypingText } from "../../components/(Home)";
import { staggerContainer } from "../../utils/motion";
import { exploreWorlds } from "../../constants";

const Explore = () => {
  const [active, setActive] = useState("world-2");

  return (
    <section className="paddings" id="explore">
      <motion.div
        variants={staggerContainer(0.25, 0.25)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.25 }}
        className="innerWidth mx-auto flex flex-col"
      >
        <TypingText title="| Employment with AI" textStyles="text-center" />
        <TitleText
          title={
            <>
              다양한 AI서비스 제공 <br className="md:block hidden" />
            </>
          }
          textStyles="text-center"
        />
        <div className="mt-[50px] flex lg:flex-row flex-col min-h-[70wh] gap-5">
          {exploreWorlds.map((world, index) => (
            <ExploreCard
              key={world.title}
              {...world}
              active={active}
              index={index}
              handleClick={setActive}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Explore;
