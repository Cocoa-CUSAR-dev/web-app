import { type ReactNode, useId } from "react";

import { palette as P, shade } from "./palette";

type Point = readonly [number, number];

// Seeded PRNG so server and client render identical scenes.
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number) => n.toFixed(1);

// Catmull-Rom through the points, as cubic Beziers.
function smooth(points: readonly Point[]) {
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${p2[0]},${p2[1]}`;
  }
  return d;
}

// Ids must be unique across every inline SVG on the page, and usable in url().
function useSvgId(prefix: string) {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

// A cut-paper hill: lit along the ridge, darkening toward its base, with a
// bright cut edge on top.
function Hill({ points, fill }: { points: readonly Point[]; fill: string }) {
  const id = useSvgId("hill");
  const top = smooth(points);
  const ridgeY = Math.min(...points.map(([, y]) => y));
  return (
    <>
      <defs>
        <linearGradient
          id={id}
          gradientUnits={"userSpaceOnUse"}
          x1={0}
          y1={ridgeY}
          x2={0}
          y2={ridgeY + 300}
        >
          <stop offset={0} stopColor={shade(fill, 0.07)} />
          <stop offset={0.55} stopColor={fill} />
          <stop offset={1} stopColor={shade(fill, -0.1)} />
        </linearGradient>
      </defs>
      <path d={`${top} L1500,900 L-60,900 Z`} fill={`url(#${id})`} />
      <path
        d={top}
        fill={"none"}
        stroke={"rgba(255,255,255,.55)"}
        strokeWidth={2.5}
      />
    </>
  );
}

// Haze pooling at the foot of a far layer (atmospheric perspective); place it
// so it ends where the next, nearer ridge rises.
function Mist({
  y,
  height = 150,
  color = "#ffffff",
  opacity = 0.6,
}: {
  y: number;
  height?: number;
  color?: string;
  opacity?: number;
}) {
  const id = useSvgId("mist");
  return (
    <>
      <defs>
        <linearGradient id={id} x1={0} y1={0} x2={0} y2={1}>
          <stop offset={0} stopColor={color} stopOpacity={0} />
          <stop offset={0.7} stopColor={color} stopOpacity={opacity} />
          <stop offset={1} stopColor={color} stopOpacity={opacity} />
        </linearGradient>
      </defs>
      <rect x={-60} y={y} width={1560} height={height} fill={`url(#${id})`} />
    </>
  );
}

// Soft radial light, e.g. sun falling on a canopy or a lantern's glow.
function Glow({
  x,
  y,
  rx,
  ry = rx,
  color = "#fff6e0",
  opacity = 0.45,
}: {
  x: number;
  y: number;
  rx: number;
  ry?: number;
  color?: string;
  opacity?: number;
}) {
  const id = useSvgId("glow");
  return (
    <>
      <defs>
        <radialGradient id={id}>
          <stop offset={0} stopColor={color} stopOpacity={opacity} />
          <stop offset={1} stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#${id})`} />
    </>
  );
}

function SunRays({
  x,
  y,
  color = P.sun,
  count = 14,
  length = 1100,
}: {
  x: number;
  y: number;
  color?: string;
  count?: number;
  length?: number;
}) {
  const id = useSvgId("rays");
  return (
    <g>
      <defs>
        <radialGradient
          id={id}
          gradientUnits={"userSpaceOnUse"}
          cx={x}
          cy={y}
          r={length}
        >
          <stop offset={0} stopColor={color} stopOpacity={0.55} />
          <stop offset={0.6} stopColor={color} stopOpacity={0.08} />
          <stop offset={1} stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        const spread = i % 2 ? 0.05 : 0.09;
        return (
          <path
            key={i}
            d={`M${x},${y} L${f(x + Math.cos(a - spread) * length)},${f(y + Math.sin(a - spread) * length)} L${f(x + Math.cos(a + spread) * length)},${f(y + Math.sin(a + spread) * length)} Z`}
            fill={`url(#${id})`}
          />
        );
      })}
    </g>
  );
}

function Sky({
  id,
  colors,
}: {
  id: string;
  colors: readonly [string, string];
}) {
  return (
    <>
      <defs>
        <linearGradient id={id} x1={0} y1={0} x2={0} y2={1}>
          <stop offset={0} stopColor={colors[0]} />
          <stop offset={1} stopColor={colors[1]} />
        </linearGradient>
      </defs>
      <rect x={-60} y={-60} width={1560} height={960} fill={`url(#${id})`} />
    </>
  );
}

function Sun({
  x,
  y,
  r = 66,
  color = P.sun,
}: {
  x: number;
  y: number;
  r?: number;
  color?: string;
}) {
  return (
    <>
      <circle cx={x} cy={y} r={r * 2.3} fill={color} opacity={0.25} />
      <circle cx={x} cy={y} r={r * 1.6} fill={color} opacity={0.45} />
      <circle cx={x} cy={y} r={r} fill={color} />
    </>
  );
}

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} fill={P.cloud}>
      <rect x={-70} y={0} width={160} height={30} rx={15} />
      <circle cx={-20} cy={2} r={26} />
      <circle cx={20} cy={-6} r={34} />
      <circle cx={52} cy={6} r={20} />
    </g>
  );
}

// Cocoa leaf: broad oblong blade with an acuminate drip tip; the two halves
// are shaded apart along the midrib for the folded-paper look.
function Leaf({
  x,
  y,
  angle,
  len,
  fill,
  width = 1,
}: {
  x: number;
  y: number;
  angle: number;
  len: number;
  fill: string;
  width?: number;
}) {
  const s = len / 100;
  return (
    <g
      transform={`translate(${f(x)},${f(y)}) rotate(${f(angle)}) scale(${s.toFixed(3)},${(s * width).toFixed(3)})`}
    >
      <path d={"M-6,0 L2,0"} stroke={shade(fill, -0.12)} strokeWidth={3} />
      <path
        d={"M0,0 C14,-17 44,-23 72,-13 C86,-7 96,-1 108,3 C72,2 36,1 0,0 Z"}
        fill={shade(fill, 0.08)}
      />
      <path
        d={"M0,0 C36,1 72,2 108,3 C96,9 85,14 72,17 C44,24 14,16 0,0 Z"}
        fill={fill}
      />
    </g>
  );
}

// Cocoa pod: ellipsoid with ten furrows and a pointed tip on a short peduncle.
function Pod({
  x,
  y,
  angle,
  size,
  fill,
}: {
  x: number;
  y: number;
  angle: number;
  size: number;
  fill: string;
}) {
  return (
    <g
      transform={`translate(${f(x)},${f(y)}) rotate(${f(angle)}) scale(${(size / 100).toFixed(3)})`}
    >
      <path
        d={"M0,0 L0,12"}
        stroke={P.trunkDark}
        strokeWidth={5}
        strokeLinecap={"round"}
      />
      <path
        d={
          "M0,10 C13,12 20,30 20,54 C20,77 11,95 0,104 C-11,95 -20,77 -20,54 C-20,30 -13,12 0,10 Z"
        }
        fill={fill}
      />
      <path
        d={"M-10,17 C-17,42 -16,74 -6,96 M0,11 L0,103 M10,17 C17,42 16,74 6,96"}
        stroke={"rgba(0,0,0,.18)"}
        strokeWidth={2.2}
        fill={"none"}
      />
      <path
        d={"M-6,22 C-11,40 -11,60 -8,74"}
        stroke={"rgba(255,255,255,.35)"}
        strokeWidth={3}
        fill={"none"}
        strokeLinecap={"round"}
      />
    </g>
  );
}

function Flowers({ x, y }: { x: number; y: number }) {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <circle
          key={i}
          cx={f(x + Math.cos(i * 1.3) * 5)}
          cy={f(y + Math.sin(i * 1.3) * 4)}
          r={2.2}
          fill={"#fbe9ef"}
        />
      ))}
    </>
  );
}

type Bezier = readonly [Point, Point, Point, Point];

function bezierAt([p0, c1, c2, p3]: Bezier, t: number) {
  const u = 1 - t;
  const pt = (i: 0 | 1) =>
    u * u * u * p0[i] +
    3 * u * u * t * c1[i] +
    3 * u * t * t * c2[i] +
    t * t * t * p3[i];
  return { x: pt(0), y: pt(1) };
}

// Theobroma cacao: a single trunk forking into a fan of 4-5 branches
// (jorquette), a dense drooping crown, red-bronze flush leaves at the tips,
// and pods plus flowers borne straight on the trunk (cauliflory).
function CocoaTree({
  x,
  base,
  height,
  seed,
  mirror = false,
}: {
  x: number;
  base: number;
  height: number;
  seed: number;
  mirror?: boolean;
}) {
  const r = rng(seed);
  const jy = base - height;
  const fork: Point = [x + 8, jy];
  const branches: Bezier[] = [
    [fork, [x - 30, jy - 30], [x - 110, jy - 70], [x - 200, jy - 80]],
    [fork, [x - 10, jy - 60], [x - 40, jy - 140], [x - 70, jy - 200]],
    [fork, [x + 20, jy - 70], [x + 60, jy - 150], [x + 80, jy - 210]],
    [fork, [x + 40, jy - 30], [x + 120, jy - 90], [x + 200, jy - 100]],
    [fork, [x + 50, jy - 10], [x + 150, jy - 20], [x + 240, jy + 10]],
  ];
  const back: ReactNode[] = [];
  const front: ReactNode[] = [];
  const tips: ReactNode[] = [];
  branches.forEach((b, bi) => {
    for (let t = 0.4; t <= 1.001; t += 0.12) {
      const p = bezierAt(b, t);
      for (const side of [-1, 1]) {
        const ang = 90 + side * (28 + r() * 30);
        back.push(
          <Leaf
            key={`b${bi}-${t}-${side}`}
            x={p.x}
            y={p.y - 6}
            angle={ang - side * 25}
            len={120 + r() * 30}
            fill={shade(P.leaf[0], -0.04)}
          />,
        );
        front.push(
          <Leaf
            key={`f${bi}-${t}-${side}`}
            x={p.x}
            y={p.y}
            angle={ang}
            len={105 + r() * 35}
            fill={P.leaf[1 + Math.floor(r() * 2)]}
          />,
        );
      }
    }
    const end = bezierAt(b, 1);
    if (bi % 2 === 0) {
      [64, 96, 124].forEach((a, k) =>
        tips.push(
          <Leaf
            key={`t${bi}-${k}`}
            x={end.x}
            y={end.y + 4}
            angle={a + (r() - 0.5) * 10}
            len={58 + r() * 14}
            fill={k === 1 ? P.young : shade(P.young, 0.12)}
            width={0.75}
          />,
        ),
      );
    } else {
      [70, 112].forEach((a, k) =>
        tips.push(
          <Leaf
            key={`t${bi}-${k}`}
            x={end.x}
            y={end.y}
            angle={a}
            len={70 + r() * 15}
            fill={P.leaf[2]}
          />,
        ),
      );
    }
  });
  const pods: [number, number, number, number][] = [
    [x - 16, jy + 60, 16, 66],
    [x + 30, jy + 100, -14, 72],
    [x - 20, jy + 150, 12, 68],
    [x + 32, jy + 190, -10, 62],
    [x - 12, jy + 215, 8, 64],
    [x - 46, jy - 18, 26, 56],
    [x + 66, jy - 20, -24, 58],
  ];
  return (
    <g
      transform={mirror ? `translate(${2 * x + 16},0) scale(-1,1)` : undefined}
    >
      {back}
      <path
        d={`M${x - 22},${base + 20} C${x - 12},${base - height * 0.45} ${x - 6},${jy + 60} ${x - 2},${jy} L${x + 18},${jy} C${x + 22},${jy + 60} ${x + 28},${base - height * 0.45} ${x + 40},${base + 20} Z`}
        fill={P.trunk}
      />
      <path
        d={`M${x + 14},${base + 10} C${x + 16},${base - height * 0.4} ${x + 14},${jy + 70} ${x + 12},${jy + 6}`}
        stroke={P.trunkDark}
        strokeWidth={5}
        fill={"none"}
        opacity={0.55}
      />
      {branches.map(([p0, c1, c2, p3], bi) => (
        <path
          key={bi}
          d={`M${p0[0]},${p0[1]} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p3[0]},${p3[1]}`}
          stroke={P.trunk}
          strokeWidth={13 - bi}
          strokeLinecap={"round"}
          fill={"none"}
        />
      ))}
      {front}
      {tips}
      {pods.map(([px, py, a, s], i) => (
        <Pod
          key={i}
          x={px}
          y={py}
          angle={a}
          size={s}
          fill={P.podColors[i % P.podColors.length]}
        />
      ))}
      {[
        [x + 6, jy + 40],
        [x - 6, jy + 120],
        [x + 20, jy + 170],
        [x + 4, jy + 250],
      ].map(([fx, fy], i) => (
        <Flowers key={i} x={fx} y={fy} />
      ))}
    </g>
  );
}

function SmallCocoa({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${f(x)},${f(y)}) scale(${s.toFixed(2)})`}>
      <path d={"M0,0 L0,-26"} stroke={P.trunk} strokeWidth={4} />
      <ellipse cx={-10} cy={-34} rx={16} ry={12} fill={P.leaf[0]} />
      <ellipse cx={10} cy={-36} rx={16} ry={13} fill={P.leaf[1]} />
      <ellipse cx={0} cy={-46} rx={15} ry={12} fill={P.leaf[2]} />
      <ellipse cx={-3} cy={-14} rx={3} ry={5} fill={"#d9822b"} />
    </g>
  );
}

function CocoaRows({
  seed,
  x0,
  y0,
  cols = 14,
  rows = 3,
}: {
  seed: number;
  x0: number;
  y0: number;
  cols?: number;
  rows?: number;
}) {
  const r = rng(seed);
  const trees: ReactNode[] = [];
  for (let row = 0; row < rows; row++) {
    for (let i = 0; i < cols; i++) {
      trees.push(
        <SmallCocoa
          key={`${row}-${i}`}
          x={x0 + i * 70 + row * 20 + r() * 12}
          y={y0 + row * 34 - i * 4 + r() * 6}
          s={0.55 + row * 0.12}
        />,
      );
    }
  }
  return <>{trees}</>;
}

// Coconut palm, the usual shade/intercrop tree in southern Thai cocoa plots.
function Palm({
  x,
  y,
  h,
  lean,
}: {
  x: number;
  y: number;
  h: number;
  lean: number;
}) {
  const top: Point = [x + lean, y - h];
  const fronds: ReactNode[] = [];
  [-165, -140, -112, -80, -52, -22, 8, 150].forEach((a) => {
    const rad = (a * Math.PI) / 180;
    const len = 95;
    const ex = top[0] + Math.cos(rad) * len;
    const ey = top[1] + Math.sin(rad) * len * 0.45 + 34;
    const mx = top[0] + Math.cos(rad) * len * 0.55;
    const my = top[1] + Math.sin(rad) * len * 0.45 - 14;
    fronds.push(
      <path
        key={`r${a}`}
        d={`M${top[0]},${top[1]} Q${f(mx)},${f(my)} ${f(ex)},${f(ey)}`}
        stroke={P.palm}
        strokeWidth={3}
        fill={"none"}
      />,
    );
    for (let t = 0.2; t < 1; t += 0.12) {
      const u = 1 - t;
      const px = u * u * top[0] + 2 * u * t * mx + t * t * ex;
      const py = u * u * top[1] + 2 * u * t * my + t * t * ey;
      const l = 26 * (1 - t * 0.6);
      fronds.push(
        <path
          key={`${a}-${t}`}
          d={`M${f(px)},${f(py)} l${f(-l * 0.35)},${f(l)} M${f(px)},${f(py)} l${f(l * 0.35)},${f(l)}`}
          stroke={P.palm}
          strokeWidth={3.5}
          strokeLinecap={"round"}
        />,
      );
    }
  });
  return (
    <>
      <path
        d={`M${x},${y} Q${x + lean * 0.2},${y - h * 0.6} ${top[0]},${top[1]}`}
        stroke={P.palm}
        strokeWidth={7}
        fill={"none"}
        strokeLinecap={"round"}
      />
      {fronds}
    </>
  );
}

function Grass({
  seed,
  y,
  color1,
  color2,
}: {
  seed: number;
  y: number;
  color1: string;
  color2: string;
}) {
  const r = rng(seed);
  return (
    <>
      {Array.from({ length: 40 }, (_, i) => {
        const x = i * 38 + r() * 10;
        const h = 22 + r() * 30;
        return (
          <path
            key={i}
            d={`M${f(x)},${y} L${f(x + 8)},${f(y - h)} L${f(x + 16)},${y} Z`}
            fill={i % 2 ? color1 : color2}
          />
        );
      })}
    </>
  );
}

function Bird({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <path
      d={`M${x - 10 * s},${y} Q${x - 5 * s},${y - 6 * s} ${x},${y} Q${x + 5 * s},${y - 6 * s} ${x + 10 * s},${y}`}
      stroke={P.sub}
      strokeWidth={2}
      fill={"none"}
      strokeLinecap={"round"}
    />
  );
}

export {
  Bird,
  Cloud,
  CocoaRows,
  CocoaTree,
  f,
  Glow,
  Grass,
  Hill,
  Leaf,
  Mist,
  Palm,
  Pod,
  type Point,
  rng,
  Sky,
  smooth,
  Sun,
  SunRays,
};
