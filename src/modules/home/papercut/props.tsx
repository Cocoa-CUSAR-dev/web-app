import { palette as P, shade } from "./palette";
import { f, Leaf, Pod, rng } from "./primitives";

function Basket({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <Pod x={-48} y={-118} angle={-60} size={70} fill={P.podColors[2]} />
      <Pod x={-6} y={-130} angle={-8} size={74} fill={P.podColors[1]} />
      <Pod x={34} y={-124} angle={48} size={70} fill={P.podColors[3]} />
      <path d={"M-110,-70 L110,-70 L86,0 L-86,0 Z"} fill={P.wood} />
      {[-52, -26, 0, 26, 52].map((dx) => (
        <path
          key={dx}
          d={`M${dx * 1.6},-70 L${dx * 1.25},0`}
          stroke={P.woodDark}
          strokeWidth={3}
          opacity={0.6}
        />
      ))}
      {[-52, -34, -16].map((dy) => (
        <path
          key={dy}
          d={`M${-110 + (dy + 70) * 0.34},${dy} L${110 - (dy + 70) * 0.34},${dy}`}
          stroke={P.woodDark}
          strokeWidth={3}
          opacity={0.45}
        />
      ))}
      <rect
        x={-116}
        y={-78}
        width={232}
        height={14}
        rx={7}
        fill={shade(P.wood, -0.08)}
      />
    </g>
  );
}

// A split ripe pod showing the bean cluster in white mucilage.
function OpenPod({
  x,
  y,
  angle = 0,
  s = 1,
}: {
  x: number;
  y: number;
  angle?: number;
  s?: number;
}) {
  const beans = [];
  for (let row = 0; row < 5; row++) {
    for (const col of [-1, 0, 1]) {
      beans.push(
        <ellipse
          key={`${row}${col}`}
          cx={col * 12}
          cy={-58 + row * 24}
          rx={8}
          ry={11}
          fill={P.pulp}
          stroke={shade(P.pulp, -0.12)}
          strokeWidth={1.5}
        />,
      );
    }
  }
  return (
    <g transform={`translate(${x},${y}) rotate(${angle}) scale(${s})`}>
      <path
        d={
          "M0,-90 C40,-80 54,-30 52,10 C50,50 30,80 0,92 C-30,80 -50,50 -52,10 C-54,-30 -40,-80 0,-90 Z"
        }
        fill={P.podColors[2]}
      />
      <path
        d={
          "M0,-78 C30,-70 40,-30 38,8 C36,44 22,70 0,80 C-22,70 -36,44 -38,8 C-40,-30 -30,-70 0,-78 Z"
        }
        fill={"#f3e2c8"}
      />
      {beans}
    </g>
  );
}

function DryingRack({
  x,
  y,
  w,
  seed,
}: {
  x: number;
  y: number;
  w: number;
  seed: number;
}) {
  const r = rng(seed);
  const beans = [];
  for (let i = 0; i < w / 9; i++) {
    beans.push(
      <ellipse
        key={i}
        cx={f(x + 8 + i * 9 + r() * 3)}
        cy={f(y - 6 - r() * 6)}
        rx={5}
        ry={3.4}
        fill={i % 3 ? P.bean : shade(P.bean, 0.1)}
      />,
    );
  }
  return (
    <g>
      <rect x={x + 10} y={y} width={8} height={70} fill={P.woodDark} />
      <rect x={x + w - 18} y={y} width={8} height={70} fill={P.woodDark} />
      <rect x={x} y={y - 4} width={w} height={14} rx={3} fill={P.wood} />
      {beans}
    </g>
  );
}

// Wooden fermentation box covered with banana leaves.
function FermentBox({ x, y, w = 200 }: { x: number; y: number; w?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={90} fill={P.wood} />
      {[0.25, 0.5, 0.75].map((t) => (
        <path
          key={t}
          d={`M${x},${y + 90 * t} L${x + w},${y + 90 * t}`}
          stroke={P.woodDark}
          strokeWidth={3}
          opacity={0.5}
        />
      ))}
      <path
        d={`M${x - 14},${y + 6} C${x + w * 0.3},${y - 34} ${x + w * 0.7},${y - 30} ${x + w + 16},${y + 4} C${x + w * 0.6},${y - 6} ${x + w * 0.3},${y - 4} ${x - 14},${y + 6} Z`}
        fill={P.leaf[2]}
      />
      <path
        d={`M${x - 4},${y + 2} C${x + w * 0.35},${y - 16} ${x + w * 0.7},${y - 14} ${x + w + 8},${y + 2}`}
        stroke={"rgba(255,255,255,.35)"}
        strokeWidth={2}
        fill={"none"}
      />
    </g>
  );
}

function Sack({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path
        d={"M-46,0 C-56,-50 -40,-90 -24,-104 L24,-104 C40,-90 56,-50 46,0 Z"}
        fill={"#d9c2a0"}
      />
      <path
        d={"M-26,-104 C-16,-114 16,-114 26,-104"}
        stroke={"#b39a76"}
        strokeWidth={6}
        fill={"none"}
      />
      {[-18, 0, 18].map((dx) => (
        <ellipse key={dx} cx={dx} cy={-108} rx={7} ry={5} fill={P.bean} />
      ))}
    </g>
  );
}

function ChocolateBar({
  x,
  y,
  angle = 0,
  wrapper,
}: {
  x: number;
  y: number;
  angle?: number;
  wrapper: string;
}) {
  return (
    <g transform={`translate(${x},${y}) rotate(${angle})`}>
      <rect x={0} y={0} width={70} height={110} rx={4} fill={P.chocolate} />
      {[0, 1, 2].map((row) =>
        [0, 1].map((col) => (
          <rect
            key={`${row}${col}`}
            x={8 + col * 29}
            y={8 + row * 22}
            width={25}
            height={18}
            rx={2}
            fill={shade(P.chocolate, 0.06)}
          />
        )),
      )}
      <rect x={0} y={72} width={70} height={38} rx={2} fill={wrapper} />
      <rect
        x={10}
        y={84}
        width={50}
        height={6}
        rx={3}
        fill={"rgba(255,255,255,.6)"}
      />
    </g>
  );
}

function Stall({ x, y }: { x: number; y: number }) {
  const stripes = Array.from({ length: 8 }, (_, i) => i);
  return (
    <g>
      <rect x={x + 10} y={y - 230} width={10} height={230} fill={P.woodDark} />
      <rect x={x + 380} y={y - 230} width={10} height={230} fill={P.woodDark} />
      {stripes.map((i) => (
        <path
          key={i}
          d={`M${x - 10 + i * 52.5},${y - 250} L${x + 42.5 + i * 52.5},${y - 250} L${x + 42.5 + i * 52.5},${y - 214} Q${x + 16 + i * 52.5},${y - 196} ${x - 10 + i * 52.5},${y - 214} Z`}
          fill={i % 2 ? P.pulp : P.wrapper[0]}
        />
      ))}
      <rect
        x={x - 20}
        y={y - 262}
        width={440}
        height={16}
        rx={6}
        fill={P.woodDark}
      />
      <rect x={x} y={y - 80} width={400} height={80} fill={P.wood} />
      <rect
        x={x - 8}
        y={y - 90}
        width={416}
        height={14}
        rx={4}
        fill={shade(P.wood, -0.1)}
      />
      <ChocolateBar x={x + 30} y={y - 196} angle={-6} wrapper={P.wrapper[1]} />
      <ChocolateBar x={x + 112} y={y - 200} wrapper={P.wrapper[2]} />
      <ChocolateBar x={x + 194} y={y - 198} angle={5} wrapper={P.wrapper[3]} />
      <Pod
        x={x + 300}
        y={y - 200}
        angle={-20}
        size={76}
        fill={P.podColors[3]}
      />
      <Pod x={x + 340} y={y - 190} angle={18} size={70} fill={P.podColors[1]} />
    </g>
  );
}

function Sapling({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path
        d={"M0,0 C2,-40 -4,-80 2,-130"}
        stroke={P.trunk}
        strokeWidth={6}
        fill={"none"}
        strokeLinecap={"round"}
      />
      <Leaf x={2} y={-128} angle={-70} len={90} fill={P.young} width={0.8} />
      <Leaf
        x={2}
        y={-126}
        angle={-115}
        len={84}
        fill={shade(P.young, 0.1)}
        width={0.8}
      />
      <Leaf x={0} y={-90} angle={20} len={110} fill={P.leaf[1]} />
      <Leaf x={0} y={-70} angle={160} len={104} fill={P.leaf[2]} />
      <Leaf x={0} y={-40} angle={30} len={96} fill={P.leaf[0]} />
      <path d={"M-60,4 C-30,-8 30,-8 60,4 Z"} fill={P.trunkDark} />
    </g>
  );
}

function Stars({ seed, count = 40 }: { seed: number; count?: number }) {
  const r = rng(seed);
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <circle
          key={i}
          cx={f(r() * 1440)}
          cy={f(r() * 320)}
          r={f(1 + r() * 1.8)}
          fill={"#ffffff"}
          opacity={f(0.4 + r() * 0.5)}
        />
      ))}
    </>
  );
}

export {
  Basket,
  ChocolateBar,
  DryingRack,
  FermentBox,
  OpenPod,
  Sack,
  Sapling,
  Stall,
  Stars,
};
