"use client";

import { MotionConfig, motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    // reducedMotion="user" turns off transform animations here and in the recipe grid
    // for visitors who ask their system for less motion.
    <MotionConfig reducedMotion="user">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ease: "easeOut", duration: 0.35 }}>
        {children}
      </motion.div>
    </MotionConfig>
  );
}
