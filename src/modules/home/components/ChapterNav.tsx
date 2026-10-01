"use client";

import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import { type RefObject, useEffect, useState } from "react";

import { accent, homeScenes, ink } from "../homeScenes";

interface ChapterNavProps {
  container: RefObject<HTMLDivElement | null>;
  sections: RefObject<HTMLElement | null>[];
  onNavigate: (index: number) => void;
}

function ChapterNav({ container, sections, onNavigate }: ChapterNavProps) {
  const [active, setActive] = useState<number>(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(sections.findIndex((s) => s.current === entry.target));
          }
        }
      },
      { root: container.current, threshold: 0.5 },
    );
    for (const section of sections) {
      if (section.current) observer.observe(section.current);
    }
    return () => observer.disconnect();
  }, [container, sections]);

  return (
    <Stack
      component={"nav"}
      aria-label={"Page chapters"}
      position={"absolute"}
      right={"2rem"}
      top={"50%"}
      spacing={1.5}
      display={{ xs: "none", md: "flex" }}
      sx={{ transform: "translateY(-50%)", zIndex: 2 }}
    >
      {homeScenes.map((scene, index) => {
        const isActive = index === active;
        return (
          <ButtonBase
            key={scene.id}
            onClick={() => onNavigate(index)}
            aria-label={scene.label}
            aria-current={isActive ? "step" : undefined}
            sx={{
              justifyContent: "flex-end",
              gap: 1.25,
              padding: "0.25rem",
              borderRadius: "1rem",
              "&:hover .chapter-label": { opacity: 1, transform: "none" },
            }}
          >
            <Typography
              className={"chapter-label"}
              variant={"caption"}
              color={ink}
              letterSpacing={"0.15em"}
              sx={{
                opacity: isActive ? 1 : 0,
                transform: isActive ? "none" : "translateX(6px)",
                transition: "opacity 0.3s ease, transform 0.3s ease",
                textShadow: "0 0 0.75rem rgba(255,255,255,0.9)",
              }}
            >
              {scene.label.toUpperCase()}
            </Typography>
            <Box
              width={isActive ? "1.75rem" : "0.5rem"}
              height={"0.5rem"}
              borderRadius={"0.25rem"}
              sx={{
                background: isActive ? accent : "rgba(35,54,44,0.3)",
                transition: "width 0.35s ease, background 0.35s ease",
              }}
            />
          </ButtonBase>
        );
      })}
    </Stack>
  );
}

export default ChapterNav;
