"use client";

import { Box, Typography, useTheme } from "@mui/material";

function CocoaCupLoader({
  caption,
  accessibleLabel = "Loading",
}: {
  /** Visible text under the animation. Omit for icon-only (the default). */
  caption?: string;
  /** Screen-reader-only label; never rendered as visible text. */
  accessibleLabel?: string;
}) {
  const theme = useTheme();
  const { dark, light } = theme.palette.primary;
  // The liquid represents actual cocoa, so it stays this brown regardless
  // of the app's brand color -- not derived from the theme on purpose.
  const cocoaBrown = "#6F4426";

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
      gap={1.5}
      py={4}
    >
      <svg
        width={96}
        height={96}
        viewBox={"0 0 120 120"}
        role={"img"}
        aria-label={accessibleLabel}
      >
        <clipPath id={"cocoa-cup-clip"}>
          <path d={"M35.5,54 L84.5,54 L79,94 L41,94 Z"} />
        </clipPath>
        <rect
          className={"cocoa-cup-loader-liquid"}
          x={30}
          y={92}
          width={60}
          height={6}
          fill={cocoaBrown}
          clipPath={"url(#cocoa-cup-clip)"}
        />
        <path
          d={"M34,52 L86,52 L80,96 L40,96 Z"}
          fill={"none"}
          stroke={dark}
          strokeWidth={2}
        />
        <path
          d={"M86,58 C100,58 100,80 86,80"}
          fill={"none"}
          stroke={dark}
          strokeWidth={2}
        />
        <g
          className={"cocoa-cup-loader-steam"}
          stroke={light}
          strokeWidth={1.5}
          fill={"none"}
          strokeLinecap={"round"}
        >
          <path d={"M48,44 C44,36 52,32 48,24"} />
          <path d={"M60,44 C56,36 64,32 60,24"} />
          <path d={"M72,44 C68,36 76,32 72,24"} />
        </g>
      </svg>
      {caption && (
        <Typography variant={"body2"} color={"text.secondary"}>
          {caption}
        </Typography>
      )}
    </Box>
  );
}

export default CocoaCupLoader;
