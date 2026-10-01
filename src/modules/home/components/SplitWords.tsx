"use client";

import { Box } from "@mui/material";
import { motion } from "framer-motion";
import { useContext } from "react";

import { ScrollRootContext } from "./Reveal";

interface SplitWordsProps {
  text: string;
  // "view": replay as the words scroll into view; "mount": play once on load.
  trigger?: "view" | "mount";
  delay?: number;
  stagger?: number;
  color?: string;
}

// Each word rises out of its own clipped line box, like type set into a slot.
function SplitWords({
  text,
  trigger = "view",
  delay = 0,
  stagger = 0.07,
  color,
}: SplitWordsProps) {
  const root = useContext(ScrollRootContext);
  const playProps =
    trigger === "mount"
      ? { animate: "shown" }
      : {
          whileInView: "shown",
          viewport: { root: root ?? undefined, amount: 0.6 },
        };

  return (
    <motion.span
      initial={"hidden"}
      {...playProps}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      style={{ display: "inline" }}
      aria-label={text}
    >
      {text.split(" ").map((word, i) => (
        <Box
          key={`${word}-${i}`}
          component={"span"}
          aria-hidden={true}
          sx={{
            display: "inline-block",
            overflow: "hidden",
            verticalAlign: "bottom",
            paddingBottom: "0.08em",
            marginBottom: "-0.08em",
          }}
        >
          <motion.span
            variants={{
              hidden: { y: "110%", rotate: 4 },
              shown: {
                y: "0%",
                rotate: 0,
                transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            style={{ display: "inline-block", color }}
          >
            {word}
            {i < text.split(" ").length - 1 ? " " : ""}
          </motion.span>
        </Box>
      ))}
    </motion.span>
  );
}

export default SplitWords;
