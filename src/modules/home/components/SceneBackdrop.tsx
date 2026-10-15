"use client";

import { Box } from "@mui/material";
import {
  motion,
  type MotionValue,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  memo,
  type ReactNode,
  type RefObject,
  startTransition,
  useEffect,
  useId,
  useState,
} from "react";

import { useMappedTransform } from "../hooks/useMappedTransform";
import {
  type CopySide,
  type PaperLayer,
  paperScenes,
} from "../papercut/scenes";

// On portrait phones the 16:9 landscape is sized off the height (80dvh wide,
// ~45% of the screen tall), leaving open sky above it for the copy.
const SCENE_WIDTH = "max(110%, 80dvh)";

// Light wash behind the chapter's copy so text never fights the art. On
// phones copy always stacks at the top; on desktop it follows the copy side.
const SCRIM = "253,243,228";
const scrimBackground: Record<CopySide, string> = {
  left: `linear-gradient(90deg, rgba(${SCRIM},0.94) 0%, rgba(${SCRIM},0.82) 38%, rgba(${SCRIM},0.35) 55%, rgba(${SCRIM},0) 68%)`,
  right: `linear-gradient(270deg, rgba(${SCRIM},0.94) 0%, rgba(${SCRIM},0.82) 38%, rgba(${SCRIM},0.35) 55%, rgba(${SCRIM},0) 68%)`,
  center: `radial-gradient(ellipse 62% 72% at 50% 46%, rgba(${SCRIM},0.9) 0%, rgba(${SCRIM},0.7) 45%, rgba(${SCRIM},0) 80%)`,
};
const scrimMobile = `linear-gradient(180deg, rgba(${SCRIM},0.92) 0%, rgba(${SCRIM},0.75) 45%, rgba(${SCRIM},0) 80%)`;

// Crossfade while the next chapter's top travels from 85% to 35% of the
// viewport -- short enough that two scenes never sit muddily on top of each other.
const ENTER_OFFSET: ["start 0.85", "start 0.35"] = ["start 0.85", "start 0.35"];

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const easeInCubic = (t: number) => t ** 3;

// Where each chapter's main subject sits (-1 left, 0 centre, 1 right); the
// copy takes the opposite side. Between chapters the camera pans from one
// subject to the next instead of the art just swapping sides.
const subjectSide: Record<CopySide, number> = { left: 1, center: 0, right: -1 };
const subjectOf = (i: number) => subjectSide[paperScenes[i].copy];
// Pan per unit of subject travel, in % of layer width, for a depth-1 layer.
const PAN = 7;

interface LayerPart {
  depth: number;
  shadow: boolean;
  node: ReactNode;
}
interface RenderLayer extends PaperLayer {
  parts: LayerPart[];
}

// Each composited layer is a full-screen GPU texture; with ~13 per scene the
// browser ran out of tile memory on large screens and dropped tiles mid-scroll
// (blocks flickering). Neighbouring static layers at similar depth are merged
// into one; each keeps its own paper shadow, baked into the SVG.
function mergeStaticLayers(layers: PaperLayer[]): RenderLayer[] {
  const out: RenderLayer[] = [];
  for (const layer of layers) {
    const part = {
      depth: layer.depth,
      shadow: layer.shadow !== false,
      node: layer.node,
    };
    const group = out.at(-1);
    const joinable =
      group &&
      !group.motion &&
      !layer.motion &&
      (group.align ?? "xMidYMid") === (layer.align ?? "xMidYMid") &&
      (group.depth === 0
        ? layer.depth <= 0.1
        : layer.depth - group.parts[0].depth <= 0.2);
    if (group && joinable) {
      group.parts.push(part);
      if (group.depth !== 0) {
        group.depth =
          group.parts.reduce((sum, p) => sum + p.depth, 0) / group.parts.length;
      }
    } else {
      out.push({ ...layer, parts: [part] });
    }
  }
  return out;
}

const renderScenes = paperScenes.map((scene) => ({
  ...scene,
  layers: mergeStaticLayers(scene.layers),
}));

interface LayerProps {
  layer: RenderLayer;
  pass: MotionValue<number>;
  enter: MotionValue<number>;
  nextEnter: MotionValue<number>;
  // Subject travel into and out of this scene (see subjectSide).
  panIn: number;
  panOut: number;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  // 0 under prefers-reduced-motion: no parallax or pan, just the crossfade.
  motionScale: number;
}

function Layer({
  layer,
  pass,
  enter,
  nextEnter,
  panIn,
  panOut,
  mouseX,
  mouseY,
  motionScale,
}: LayerProps) {
  const { depth, align = "xMidYMid", parts } = layer;
  const k = depth * motionScale;
  const shadowId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  // Nearer layers sweep further than far ones and the sky stays put, so the
  // pan reads as one camera moving through a single world.
  const x = useTransform([mouseX, enter, nextEnter], ([m, e, n]: number[]) => {
    const pan =
      (panIn * (1 - easeOutCubic(e)) - panOut * easeInCubic(n)) * PAN * k;
    return `calc(${pan.toFixed(2)}% + ${(-m * 36 * k).toFixed(1)}px)`;
  });
  const y = useTransform(
    [pass, mouseY],
    // Rounded so server and client render the same style string.
    ([p, m]: number[]) =>
      Math.round(((0.5 - p) * 140 * k - m * 16 * k) * 10) / 10,
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
        <svg
          viewBox={"0 0 1440 810"}
          preserveAspectRatio={depth === 0 ? "xMidYMid slice" : "xMidYMax meet"}
          width={"100%"}
          height={"100%"}
          style={{ display: "block", overflow: "visible" }}
        >
          {parts.map((part, i) => {
            // Nearer sheets sit further above the ones behind, so they cast
            // longer, softer, darker shadows. Static SVG filters are baked in
            // at raster time, not re-applied per frame.
            const hasShadow = part.shadow && part.depth >= 0.3;
            const id = `paper-shadow-${shadowId}-${i}`;
            return (
              <g key={i} filter={hasShadow ? `url(#${id})` : undefined}>
                {hasShadow && (
                  <defs>
                    <filter
                      id={id}
                      x={"-10%"}
                      y={"-10%"}
                      width={"120%"}
                      height={"130%"}
                    >
                      <feDropShadow
                        dx={0}
                        dy={((3 + part.depth * 9) * 0.75).toFixed(1)}
                        stdDeviation={((5 + part.depth * 12) * 0.4).toFixed(1)}
                        floodColor={"#2b1a0e"}
                        floodOpacity={(0.12 + part.depth * 0.16).toFixed(2)}
                      />
                    </filter>
                  </defs>
                )}
                {part.node}
              </g>
            );
          })}
        </svg>
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
  motionScale: number;
}

const Scene = memo(function Scene({
  index,
  container,
  sections,
  mouseX,
  mouseY,
  motionScale,
}: SceneProps) {
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

  // Floor of 0.001 (not 0) so the browser rasterizes an upcoming scene before
  // it fades in, instead of mid-transition.
  const opacity = useMappedTransform(
    enter,
    [0, 1],
    isFirst ? [1, 1] : [0.001, 1],
  );
  // Incoming scene rises into place like the camera panning down onto it.
  const y = useMappedTransform(
    enter,
    [0, 1],
    isFirst || !motionScale ? ["0%", "0%"] : ["4%", "0%"],
    easeOutCubic,
  );
  const exitY = useMappedTransform(
    nextEnter,
    [0, 1],
    motionScale ? ["0%", "-2%"] : ["0%", "0%"],
    easeOutCubic,
  );
  // Deliberately never visibility:hidden. A hidden scene isn't rasterized, so
  // when it started fading in the browser painted it on the spot and the
  // cream backdrop flashed through. The mount window keeps at most three
  // scenes around, so keeping them all painted is affordable.
  return (
    <motion.div style={{ position: "absolute", inset: 0, opacity, y }}>
      <motion.div style={{ position: "absolute", inset: 0, y: exitY }}>
        {renderScenes[index].layers.map((layer, i) => (
          <Layer
            key={i}
            layer={layer}
            pass={pass}
            enter={enter}
            nextEnter={nextEnter}
            panIn={isFirst ? 0 : subjectOf(index) - subjectOf(index - 1)}
            panOut={
              index === paperScenes.length - 1
                ? 0
                : subjectOf(index + 1) - subjectOf(index)
            }
            mouseX={mouseX}
            mouseY={mouseY}
            motionScale={motionScale}
          />
        ))}
      </motion.div>
      <Box
        position={"absolute"}
        sx={{
          inset: 0,
          background: {
            xs: scrimMobile,
            md: scrimBackground[paperScenes[index].copy],
          },
        }}
      />
    </motion.div>
  );
});

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
  const motionScale = useReducedMotion() ? 0 : 1;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e: PointerEvent) => {
      rawX.set(e.clientX / window.innerWidth - 0.5);
      rawY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [rawX, rawY]);

  // Only scenes on screen or about to be are mounted -- usually one, two
  // during a transition. Each mounted scene is a stack of full-screen GPU
  // layers; keeping neighbours around ran large screens out of tile memory.
  // A scene mounts ~0.4 viewport before its crossfade starts (time to
  // rasterize, so it never flashes in) and stays until well after it's covered.
  const [mounted, setMounted] = useState<string>("0");
  useEffect(() => {
    const scroller = container.current;
    if (!scroller) return;
    const update = () => {
      const vh = scroller.clientHeight;
      const tops = sections.map(
        (section) => section.current?.getBoundingClientRect().top ?? Infinity,
      );
      const keep = tops
        .map((top, i) => {
          const approaching = i === 0 || top < vh * 1.25;
          const coveredLongAgo =
            i < tops.length - 1 && tops[i + 1] < -vh * 0.15;
          return approaching && !coveredLongAgo ? i : -1;
        })
        .filter((i) => i >= 0)
        .join(",");
      // Mounting a scene is a few hundred SVG nodes; let React slice that
      // work up instead of blocking a scroll frame.
      startTransition(() => setMounted(keep));
    };
    update();
    scroller.addEventListener("scroll", update, { passive: true });
    return () => scroller.removeEventListener("scroll", update);
  }, [container, sections]);
  const mountedSet = new Set(mounted.split(",").map(Number));

  return (
    <Box
      position={"absolute"}
      sx={{ inset: 0, overflow: "hidden", background: "#fdf3e4" }}
      aria-hidden={true}
    >
      {paperScenes.map((scene, index) =>
        mountedSet.has(index) ? (
          <Scene
            key={scene.id}
            index={index}
            container={container}
            sections={sections}
            mouseX={mouseX}
            mouseY={mouseY}
            motionScale={motionScale}
          />
        ) : null,
      )}
      {/* Normal blending on purpose: mix-blend-mode over the moving layers
          forced a full extra blend pass every frame. */}
      <Box
        position={"absolute"}
        sx={{
          inset: 0,
          backgroundImage: grain,
          opacity: 0.08,
          pointerEvents: "none",
        }}
      />
    </Box>
  );
}

export default SceneBackdrop;
