"use client";

import { motion } from "framer-motion";
import {
  createContext,
  type ReactNode,
  type RefObject,
  useContext,
} from "react";

const ScrollRootContext =
  createContext<RefObject<HTMLDivElement | null> | null>(null);

interface RevealProps {
  children: ReactNode;
  delay?: number;
  from?: "bottom" | "left" | "right";
}

const offsets = {
  bottom: { x: 0, y: 48 },
  left: { x: -48, y: 0 },
  right: { x: 48, y: 0 },
} as const;

function Reveal({ children, delay = 0, from = "bottom" }: RevealProps) {
  const root = useContext(ScrollRootContext);
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(6px)", ...offsets[from] }}
      whileInView={{ opacity: 1, filter: "blur(0px)", x: 0, y: 0 }}
      viewport={{ root: root ?? undefined, amount: 0.35 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export { Reveal, ScrollRootContext };
