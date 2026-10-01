"use client";

import { useEffect, useRef } from "react";

import { palette } from "../papercut/palette";

interface FallingLeaf {
  x: number;
  y: number;
  size: number;
  speed: number;
  sway: number;
  phase: number;
  spin: number;
  angle: number;
  color: string;
}

const colors = [
  palette.leaf[1],
  palette.leaf[2],
  palette.young,
  palette.mtn[3],
];

// Same blade outline as the SVG cocoa leaf, normalized to a 100-unit length.
const LEAF_D =
  "M0,0 C14,-17 44,-23 72,-13 C86,-7 96,-1 108,3 C96,9 85,14 72,17 C44,24 14,16 0,0 Z";
const MIDRIB_D = "M2,0 C36,1 72,2 106,3";

function spawn(width: number, height: number, anywhere: boolean): FallingLeaf {
  return {
    x: Math.random() * width,
    y: anywhere ? Math.random() * height : -40,
    size: 14 + Math.random() * 16,
    speed: 0.35 + Math.random() * 0.55,
    sway: 0.6 + Math.random() * 1.2,
    phase: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.02,
    angle: Math.random() * Math.PI * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
  };
}

// A few cut-paper cocoa leaves drifting down over the scenes.
function FallingLeaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const leafPath = new Path2D(LEAF_D);
    const midribPath = new Path2D(MIDRIB_D);
    let width = 0;
    let height = 0;
    let leaves: FallingLeaf[] = [];
    let frame = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(16, width / 90));
      leaves = Array.from({ length: count }, () => spawn(width, height, true));
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const leaf of leaves) {
        leaf.y += leaf.speed;
        leaf.x += Math.sin(time / 1400 + leaf.phase) * leaf.sway;
        leaf.angle += leaf.spin + Math.cos(time / 1600 + leaf.phase) * 0.004;
        if (leaf.y > height + 40)
          Object.assign(leaf, spawn(width, height, false));

        const s = leaf.size / 100;
        ctx.save();
        ctx.translate(leaf.x, leaf.y);
        ctx.rotate(leaf.angle);
        // Flip on one axis over time so leaves look like they tumble.
        ctx.scale(s, s * Math.cos(time / 900 + leaf.phase));
        ctx.shadowColor = "rgba(43, 26, 14, 0.22)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = leaf.color;
        ctx.fill(leafPath);
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 2.5;
        ctx.stroke(midribPath);
        ctx.restore();
      }
      frame = requestAnimationFrame(draw);
    };

    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden={true}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}

export default FallingLeaves;
