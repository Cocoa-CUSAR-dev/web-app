import { Box } from "@mui/material";
import type { ReactNode } from "react";

const sheetSx = {
  position: "absolute",
  inset: 0,
  borderRadius: "1.5rem",
  boxShadow: "0 0.75rem 1.5rem rgba(35, 54, 44, 0.1)",
  transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

interface PaperStackProps {
  children: ReactNode;
  // Colors of the two sheets peeking out from behind the panel.
  tints?: readonly [string, string];
  // Fan direction, so neighbouring cards don't all lean the same way.
  lean?: 1 | -1;
  fill?: boolean;
}

// A panel set on two loose sheets of colored paper; they fan out on hover.
function PaperStack({
  children,
  tints = ["#d6e5dc", "#f6dccf"],
  lean = 1,
  fill = false,
}: PaperStackProps) {
  return (
    <Box
      position={"relative"}
      height={fill ? "100%" : undefined}
      sx={{
        isolation: "isolate",
        "&:hover .paper-sheet-a": {
          transform: `rotate(${-3.6 * lean}deg) translate(${-12 * lean}px, 14px)`,
        },
        "&:hover .paper-sheet-b": {
          transform: `rotate(${2.8 * lean}deg) translate(${12 * lean}px, 16px)`,
        },
      }}
    >
      <Box
        className={"paper-sheet-a"}
        sx={{
          ...sheetSx,
          background: tints[0],
          transform: `rotate(${-2 * lean}deg) translate(${-6 * lean}px, 8px)`,
        }}
      />
      <Box
        className={"paper-sheet-b"}
        sx={{
          ...sheetSx,
          background: tints[1],
          transform: `rotate(${1.5 * lean}deg) translate(${6 * lean}px, 10px)`,
        }}
      />
      <Box position={"relative"} height={fill ? "100%" : undefined}>
        {children}
      </Box>
    </Box>
  );
}

export default PaperStack;
