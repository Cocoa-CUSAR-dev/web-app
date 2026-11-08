"use client";

import { Box } from "@mui/material";
import { MotionConfig } from "framer-motion";
import Lenis from "lenis";
import { useCallback, useEffect, useMemo, useRef } from "react";

import ChapterNav from "./components/ChapterNav";
import FallingLeaves from "./components/FallingLeaves";
import Footer from "./components/Footer";
import HeroNavBar from "./components/HeroNavbar";
import HeroSection from "./components/HeroSection";
import LiteModeToggle from "./components/LiteModeToggle";
import { ScrollRootContext } from "./components/Reveal";
import SceneBackdrop from "./components/SceneBackdrop";
import { useLiteMode } from "./hooks/useLiteMode";
import AboutUsSubmodule from "./submodule/AboutUsSubmodule";
import ImpactSubmodule from "./submodule/ImpactSubmodule";
import PromoteSubmodule from "./submodule/PromoteSubmodule";

// Frames Lenis keeps ticking after a scroll settles before its loop sleeps.
const LENIS_IDLE_FRAMES = 30;

function HomeModule() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const toolsRef = useRef<HTMLElement>(null);
  const impactRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<{ lenis: Lenis; wake: () => void } | null>(null);
  const [lite, setLite] = useLiteMode();
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
    // Driven by hand, not autoRaf: autoRaf ticks every frame forever, so the
    // page kept the CPU and GPU busy (and the laptop hot) while nobody was
    // scrolling. This loop runs only while a scroll is under way.
    const lenis = new Lenis({ wrapper, content, lerp: 0.08, autoRaf: false });
    let frame = 0;
    let idleFrames = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      idleFrames = lenis.isScrolling ? 0 : idleFrames + 1;
      frame = idleFrames > LENIS_IDLE_FRAMES ? 0 : requestAnimationFrame(tick);
    };
    const wake = () => {
      idleFrames = 0;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const inputs = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
    for (const type of inputs) {
      wrapper.addEventListener(type, wake, { passive: true });
    }
    lenisRef.current = { lenis, wake };
    return () => {
      cancelAnimationFrame(frame);
      for (const type of inputs) wrapper.removeEventListener(type, wake);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollToSection = useCallback(
    (index: number) => {
      const target = sectionRefs[index].current;
      if (!target) return;
      if (lenisRef.current) {
        lenisRef.current.lenis.scrollTo(target, { duration: 1.8 });
        lenisRef.current.wake();
      } else {
        // Lenis is off under prefers-reduced-motion; jump instead of gliding.
        target.scrollIntoView({ behavior: "auto" });
      }
    },
    [sectionRefs],
  );

  return (
    // "user": under prefers-reduced-motion, reveals and headings fade in
    // without sliding (transforms off, opacity kept).
    <MotionConfig reducedMotion={"user"}>
      <Box
        position={"relative"}
        height={"100dvh"}
        overflow={"hidden"}
        className={lite ? "home-lite" : undefined}
      >
        <SceneBackdrop
          container={scrollContainerRef}
          sections={sectionRefs}
          lite={lite}
        />
        {!lite && <FallingLeaves />}
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
            // Solid-ish bar (not backdrop-filter, which is costly over moving scenes) so
            // headings scrolling underneath don't collide with the nav links.
            background: "rgba(253,243,228,0.9)",
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
        <LiteModeToggle lite={lite} onChange={setLite} />
      </Box>
    </MotionConfig>
  );
}

export default HomeModule;
