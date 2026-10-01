import { Box, Typography } from "@mui/material";

import { accent, displayFont, ink } from "../homeScenes";
import SplitWords from "./SplitWords";

interface ChapterHeadingProps {
  eyebrow: string;
  title: string;
  // Large faded chapter number set behind the heading, e.g. "01".
  numeral?: string;
  align?: "left" | "center";
}

function ChapterHeading({
  eyebrow,
  title,
  numeral,
  align = "left",
}: ChapterHeadingProps) {
  return (
    <Box position={"relative"} textAlign={align} sx={{ isolation: "isolate" }}>
      {numeral && (
        <Typography
          aria-hidden={true}
          fontFamily={displayFont}
          fontWeight={700}
          lineHeight={0.8}
          fontSize={{ xs: "7rem", sm: "10rem", md: "13rem" }}
          sx={{
            position: "absolute",
            zIndex: -1,
            top: { xs: "-2.2rem", md: "-4.5rem" },
            ...(align === "center"
              ? { left: "50%", transform: "translateX(-50%)" }
              : { left: { xs: "-0.5rem", md: "-1.5rem" } }),
            color: "rgba(59,125,85,0.06)",
            WebkitTextStroke: "2px rgba(59,125,85,0.22)",
            letterSpacing: "-0.04em",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {numeral}
        </Typography>
      )}
      <Typography
        variant={"overline"}
        color={accent}
        fontWeight={600}
        letterSpacing={"0.25em"}
        fontSize={"0.8rem"}
      >
        {eyebrow}
      </Typography>
      <Typography
        component={"h2"}
        fontFamily={displayFont}
        fontWeight={700}
        color={ink}
        fontSize={{ xs: "2.25rem", sm: "3rem", md: "3.75rem" }}
        lineHeight={1.08}
        sx={{ textShadow: "0 0.125rem 1.25rem rgba(255,255,255,0.7)" }}
      >
        <SplitWords text={title} />
      </Typography>
      <Box
        width={"4rem"}
        height={"3px"}
        borderRadius={"2px"}
        marginTop={"1.25rem"}
        marginX={align === "center" ? "auto" : 0}
        sx={{
          background: `linear-gradient(90deg, ${accent}, rgba(59,125,85,0))`,
        }}
      />
    </Box>
  );
}

export default ChapterHeading;
