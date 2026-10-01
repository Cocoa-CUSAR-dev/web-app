"use client";

import { Box } from "@mui/material";
import {
  motion,
  type MotionValue,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { type RefObject, useEffect } from "react";

import { useMappedTransform } from "../hooks/useMappedTransform";
import { type PaperLayer, paperScenes } from "../papercut/scenes";

const SCENE_WIDTH = "max(110%, 105dvh)";

// Crossfade while the next chapter's top travels from 85% to 35% of the
// viewport -- short enough that two scenes never sit muddily on top of each other.
const ENTER_OFFSET: ["start 0.85", "start 0.35"] = ["start 0.85", "start 0.35"];

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

interface LayerProps {
  layer: PaperLayer;
  pass: MotionValue<number>;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}

function Layer({ layer, pass, mouseX, mouseY }: LayerProps) {
  const { depth, align = "xMidYMid", node } = layer;
  const x = useTransform(mouseX, (m) => -m * 36 * depth);
  const y = useTransform(
    [pass, mouseY],
    ([p, m]: number[]) => (0.5 - p) * 140 * depth - m * 16 * depth,
  );

  // The sky fills the whole viewport. Everything else keeps its 16:9 shape and
  // sits on the bottom edge, so on tall/portrait screens the landscape stays
  // at a natural size below open sky instead of being zoomed in 3-4x.
  const placement =
    depth === 0
      ? { inset: "-5%" }
      : {
          bottom: "-4%",
          width: SCENE_WIDTH,
          aspectRatio: "16 / 9",
          ...(align === "xMaxYMax"
            ? { right: "-5%" }
            : align === "xMinYMax"
              ? { left: "-5%" }
              : { left: "50%", marginLeft: `calc(${SCENE_WIDTH} / -2)` }),
        };

  return (
    <motion.div
      style={{
        position: "absolute",
        ...placement,
        x,
        y,
        willChange: "transform",
      }}
    >
      {/* Ambient motion animates this whole composited box (cheap on the
          GPU) rather than the SVG inside it (a repaint every frame). */}
      <div
        className={layer.motion ? `paper-${layer.motion}` : undefined}
        style={{
          width: "100%",
          height: "100%",
          transformOrigin: layer.origin,
          animationDelay: layer.delay ? `${-layer.delay}s` : undefined,
        }}
      >
        {/* The shadow lives on a static, non-composited child so it's
            rasterized once into the moving layer, not re-filtered per frame. */}
        <div
          style={{
            width: "100%",
            height: "100%",
            // Nearer sheets sit further above the ones behind, so they cast
            // longer, softer, darker shadows.
            filter:
              depth > 0 && layer.shadow !== false
                ? `drop-shadow(0 ${(3 + depth * 9).toFixed(1)}px ${(5 + depth * 12).toFixed(1)}px rgba(43, 26, 14, ${(0.12 + depth * 0.16).toFixed(2)}))`
                : undefined,
          }}
        >
          <svg
            viewBox={"0 0 1440 810"}
            preserveAspectRatio={
              depth === 0 ? "xMidYMid slice" : "xMidYMax meet"
            }
            width={"100%"}
            height={"100%"}
            style={{ display: "block", overflow: "visible" }}
          >
            {node}
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

interface SceneProps {
  index: number;
  container: RefObject<HTMLDivElement | null>;
  sections: RefObject<HTMLElement | null>[];
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}

function Scene({ index, container, sections, mouseX, mouseY }: SceneProps) {
  const isFirst = index === 0;
  const { scrollYProgress: enter } = useScroll({
    container,
    target: sections[index],
    offset: ENTER_OFFSET,
  });
  const { scrollYProgress: nextEnter } = useScroll({
    container,
    target: sections[index + 1] ?? sections[index],
    offset: ENTER_OFFSET,
  });
  const { scrollYProgress: pass } = useScroll({
    container,
    target: sections[index],
    offset: ["start end", "end start"],
  });

  const opacity = useMappedTransform(enter, [0, 1], isFirst ? [1, 1] : [0, 1]);
  // Incoming scene rises into place like the camera panning down onto it.
  const y = useMappedTransform(
    enter,
    [0, 1],
    isFirst ? ["0%", "0%"] : ["8%", "0%"],
    easeOutCubic,
  );
  const exitY = useMappedTransform(
    nextEnter,
    [0, 1],
    ["0%", "-4%"],
    easeOutCubic,
  );
  // Skip painting a scene once the next one fully covers it.
  const visibility = useTransform([enter, nextEnter], ([e, n]: number[]) =>
    (isFirst || e > 0) && (index === paperScenes.length - 1 || n < 1)
      ? "visible"
      : "hidden",
  );

  return (
    <motion.div
      style={{ position: "absolute", inset: 0, opacity, y, visibility }}
    >
      <motion.div style={{ position: "absolute", inset: 0, y: exitY }}>
        {paperScenes[index].layers.map((layer, i) => (
          <Layer
            key={i}
            layer={layer}
            pass={pass}
            mouseX={mouseX}
            mouseY={mouseY}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

interface SceneBackdropProps {
  container: RefObject<HTMLDivElement | null>;
  sections: RefObject<HTMLElement | null>[];
}

const grain =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 .3  0 0 0 0 .25  0 0 0 0 .15  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

function SceneBackdrop({ container, sections }: SceneBackdropProps) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mouseX = useSpring(rawX, { stiffness: 60, damping: 20 });
  const mouseY = useSpring(rawY, { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e: PointerEvent) => {
      rawX.set(e.clientX / window.innerWidth - 0.5);
      rawY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [rawX, rawY]);

  return (
    <Box
      position={"absolute"}
      sx={{ inset: 0, overflow: "hidden", background: "#fdf3e4" }}
      aria-hidden={true}
    >
      {paperScenes.map((scene, index) => (
        <Scene
          key={scene.id}
          index={index}
          container={container}
          sections={sections}
          mouseX={mouseX}
          mouseY={mouseY}
        />
      ))}
      <Box
        position={"absolute"}
        sx={{
          inset: 0,
          backgroundImage: grain,
          opacity: 0.16,
          mixBlendMode: "multiply",
          pointerEvents: "none",
        }}
      />
    </Box>
  );
}

export default SceneBackdrop;
