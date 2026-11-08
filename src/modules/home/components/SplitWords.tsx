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

const visuallyHiddenSx = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

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

  const words = text.split(" ");

  return (
    <>
      {/* The real text for assistive tech: aria-label on a plain span is
          ignored by many screen readers, so the heading would read empty. */}
      <Box component={"span"} sx={visuallyHiddenSx}>
        {text}
      </Box>
      <motion.span
        initial={"hidden"}
        {...playProps}
        transition={{ staggerChildren: stagger, delayChildren: delay }}
        style={{ display: "inline" }}
        aria-hidden={true}
      >
        {words.map((word, i) => (
          <Box
            key={`${word}-${i}`}
            component={"span"}
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
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          </Box>
        ))}
      </motion.span>
    </>
  );
}

export default SplitWords;
