"use client";

import { Box } from "@mui/material";
import { useMemo, useRef } from "react";

import ChapterNav from "./components/ChapterNav";
import FallingLeaves from "./components/FallingLeaves";
import Footer from "./components/Footer";
import HeroNavBar from "./components/HeroNavbar";
import HeroSection from "./components/HeroSection";
import { ScrollRootContext } from "./components/Reveal";
import SceneBackdrop from "./components/SceneBackdrop";
import AboutUsSubmodule from "./submodule/AboutUsSubmodule";
import ImpactSubmodule from "./submodule/ImpactSubmodule";
import PromoteSubmodule from "./submodule/PromoteSubmodule";

function HomeModule() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const toolsRef = useRef<HTMLElement>(null);
  const impactRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const sectionRefs = useMemo(
    () => [heroRef, aboutRef, toolsRef, impactRef, footerRef],
    [],
  );

  return (
    <Box position={"relative"} height={"100dvh"} overflow={"hidden"}>
      <SceneBackdrop container={scrollContainerRef} sections={sectionRefs} />
      {/* Light scrim on the side the copy sits on, so text never fights the art. */}
      <Box
        position={"absolute"}
        sx={{
          inset: 0,
          pointerEvents: "none",
          background: {
            xs: "linear-gradient(180deg, rgba(253,243,228,0.85) 0%, rgba(253,243,228,0.6) 45%, rgba(253,243,228,0) 75%)",
            md: "linear-gradient(90deg, rgba(253,243,228,0.85) 0%, rgba(253,243,228,0.55) 35%, rgba(253,243,228,0) 60%)",
          },
        }}
      />
      <FallingLeaves />
      <Box
        ref={scrollContainerRef}
        position={"absolute"}
        sx={{
          inset: 0,
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "thin",
        }}
      >
        <ScrollRootContext value={scrollContainerRef}>
          <HeroSection
            ref={heroRef}
            onStartJourney={() =>
              aboutRef.current?.scrollIntoView({ behavior: "smooth" })
            }
          />
          <AboutUsSubmodule ref={aboutRef} />
          <PromoteSubmodule ref={toolsRef} />
          <ImpactSubmodule ref={impactRef} />
          <Footer ref={footerRef} />
        </ScrollRootContext>
      </Box>
      <Box
        position={"absolute"}
        top={0}
        left={0}
        right={0}
        height={"5.5rem"}
        sx={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,255,255,0))",
          pointerEvents: "none",
        }}
      />
      <HeroNavBar />
      <ChapterNav container={scrollContainerRef} sections={sectionRefs} />
    </Box>
  );
}

export default HomeModule;
