"use client";

import { Box } from "@mui/material";
import Lenis from "lenis";
import { useCallback, useEffect, useMemo, useRef } from "react";

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
  const contentRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const sectionRefs = useMemo(
    () => [heroRef, aboutRef, toolsRef, impactRef, footerRef],
    [],
  );

  // Inertial wheel scrolling: native wheel steps (~100px per notch) made every
  // scroll-linked layer jump instead of glide.
  useEffect(() => {
    const wrapper = scrollContainerRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ wrapper, content, lerp: 0.08, autoRaf: true });
    lenisRef.current = lenis;
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollToSection = useCallback(
    (index: number) => {
      const target = sectionRefs[index].current;
      if (!target) return;
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, { duration: 1.8 });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    },
    [sectionRefs],
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
            xs: "linear-gradient(180deg, rgba(253,243,228,0.92) 0%, rgba(253,243,228,0.75) 45%, rgba(253,243,228,0) 80%)",
            md: "linear-gradient(90deg, rgba(253,243,228,0.94) 0%, rgba(253,243,228,0.82) 38%, rgba(253,243,228,0.35) 55%, rgba(253,243,228,0) 68%)",
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
          <Box ref={contentRef}>
            <HeroSection
              ref={heroRef}
              onStartJourney={() => scrollToSection(1)}
            />
            <AboutUsSubmodule ref={aboutRef} />
            <PromoteSubmodule ref={toolsRef} />
            <ImpactSubmodule ref={impactRef} />
            <Footer ref={footerRef} />
          </Box>
        </ScrollRootContext>
      </Box>
      <Box
        position={"absolute"}
        top={0}
        left={0}
        right={0}
        height={"4.5rem"}
        sx={{
          // Frosted bar so headings scrolling underneath don't collide with the nav links.
          background: "rgba(253,243,228,0.72)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          maskImage: "linear-gradient(180deg, #000 70%, transparent)",
          pointerEvents: "none",
        }}
      />
      <HeroNavBar />
      <ChapterNav
        container={scrollContainerRef}
        sections={sectionRefs}
        onNavigate={scrollToSection}
      />
    </Box>
  );
}

export default HomeModule;
