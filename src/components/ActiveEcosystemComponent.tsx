import React from "react";
import { motion } from "motion/react";

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
}

export function ActiveEcosystemComponent({ children, onClick }: Props) {
  return (
    <motion.div
      onClick={onClick}
      className="inline-block cursor-pointer transition-colors"
    >
      {children}
    </motion.div>
  );
}
