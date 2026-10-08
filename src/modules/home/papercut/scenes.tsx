import type { ReactNode } from "react";

import { palette as P, shade } from "./palette";
import {
  Cloud,
  CocoaRows,
  CocoaTree,
  Flock,
  Glow,
  Grass,
  Hill,
  Leaf,
  Mist,
  Palm,
  type Point,
  Sky,
  SunRays,
} from "./primitives";
import {
  Basket,
  DryingRack,
  FermentBox,
  Fireflies,
  OpenPod,
  Sack,
  Sapling,
  Stall,
  Stars,
  Steam,
} from "./props";

// Which side of the viewport the chapter's copy sits on (desktop).
type CopySide = "left" | "right" | "center";

interface PaperLayer {
  // 0 = sky (static), 1 = nearest foreground (moves most).
  depth: number;
  // Which edge stays in frame when the viewport is narrower than 16:9.
  align?: "xMinYMax" | "xMidYMid" | "xMaxYMax";
  // Ambient animation applied to the whole layer (see global.css paper-*).
  motion?: "sway" | "leaf" | "drift" | "spin" | "fly";
  // CSS transform-origin for the motion, in % of the 16:9 layer box.
  origin?: string;
  // Seconds into the loop to start at, so layers don't move in lockstep.
  delay?: number;
  shadow?: boolean;
  node: ReactNode;
}

// Scene coordinates (1440x810 viewBox) -> transform-origin percentages.
const at = (x: number, y: number) =>
  `${((x / 1440) * 100).toFixed(1)}% ${((y / 810) * 100).toFixed(1)}%`;

const sunLayers = (
  x: number,
  y: number,
  color: string = P.sun,
): PaperLayer[] => [
  {
    depth: 0.06,
    motion: "spin",
    origin: at(x, y),
    shadow: false,
    node: <SunRays x={x} y={y} color={color} />,
  },
  {
    depth: 0.08,
    node: (
      <>
        <circle cx={x} cy={y} r={150} fill={color} opacity={0.25} />
        <circle cx={x} cy={y} r={105} fill={color} opacity={0.45} />
        <circle cx={x} cy={y} r={66} fill={color} />
      </>
    ),
  },
];

const cloudLayer = (
  clouds: [number, number, number][],
  delay = 0,
): PaperLayer => ({
  depth: 0.1,
  motion: "drift",
  delay,
  node: (
    <>
      {clouds.map(([x, y, s]) => (
        <Cloud key={`${x}-${y}`} x={x} y={y} s={s} />
      ))}
    </>
  ),
});

const flockLayer = (y: number, delay = 0): PaperLayer => ({
  depth: 0.14,
  motion: "fly",
  delay,
  shadow: false,
  node: <Flock y={y} />,
});

const ground = (
  seed: number,
  points: readonly Point[] = [
    [-20, 760],
    [360, 730],
    [760, 770],
    [1100, 740],
    [1460, 770],
  ],
): PaperLayer => ({
  depth: 1,
  node: (
    <>
      <Hill points={points} fill={P.fg2} />
      <Grass seed={seed} y={790} color1={P.fg} color2={P.fg2} />
    </>
  ),
});

// Big foreground cocoa leaves hanging into the corners, swaying from the edge.
const cornerLeaves = (side: "left" | "right", delay = 0): PaperLayer => ({
  depth: 1,
  motion: "leaf",
  origin: side === "left" ? "0% 0%" : "100% 0%",
  delay,
  node:
    side === "left" ? (
      <>
        <Leaf x={-30} y={-20} angle={70} len={260} fill={P.fg} />
        <Leaf x={20} y={-40} angle={58} len={230} fill={P.fg2} />
        <Leaf x={-40} y={60} angle={40} len={210} fill={P.leaf[1]} />
        <Leaf x={90} y={-30} angle={95} len={180} fill={P.young} width={0.85} />
      </>
    ) : (
      <g transform={"translate(1440,0) scale(-1,1)"}>
        <Leaf x={-30} y={-30} angle={75} len={240} fill={P.fg2} />
        <Leaf x={30} y={-40} angle={60} len={200} fill={P.leaf[2]} />
        <Leaf x={-30} y={70} angle={42} len={190} fill={P.fg} />
      </g>
    ),
});

function House({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect
        x={-26}
        y={-36}
        width={52}
        height={36}
        fill={shade(P.mtn[1], -0.08)}
      />
      <path d={"M-36,-34 L0,-72 L36,-34 Z"} fill={shade(P.mtn[2], -0.1)} />
      <rect
        x={-6}
        y={-20}
        width={12}
        height={20}
        fill={shade(P.mtn[2], -0.25)}
      />
    </g>
  );
}

const paperScenes: { id: string; copy: CopySide; layers: PaperLayer[] }[] = [
  {
    id: "home",
    copy: "left",
    layers: [
      { depth: 0, node: <Sky id={"sky-home"} colors={P.skyDawn} /> },
      ...sunLayers(1050, 190),
      cloudLayer([
        [300, 150, 1],
        [820, 110, 0.7],
        [1300, 260, 0.8],
      ]),
      flockLayer(230),
      {
        depth: 0.18,
        node: (
          <>
            <Hill
              bottom={610}
              points={[
                [-20, 430],
                [160, 360],
                [320, 400],
                [480, 320],
                [660, 390],
                [840, 330],
                [1020, 380],
                [1200, 300],
                [1460, 360],
              ]}
              fill={P.mtn[0]}
            />
            <Mist y={380} height={140} color={P.skyDawn[1]} />
          </>
        ),
      },
      {
        depth: 0.3,
        node: (
          <>
            <Hill
              bottom={670}
              points={[
                [-20, 500],
                [200, 430],
                [420, 480],
                [640, 420],
                [880, 470],
                [1100, 410],
                [1300, 450],
                [1460, 420],
              ]}
              fill={P.mtn[1]}
            />
            <Mist y={450} height={120} color={P.skyDawn[1]} />
          </>
        ),
      },
      {
        depth: 0.42,
        node: (
          <>
            <Palm x={640} y={520} h={150} lean={18} />
            <Palm x={780} y={510} h={175} lean={-14} />
            <Palm x={1290} y={505} h={160} lean={10} />
            <Hill
              bottom={750}
              points={[
                [-20, 560],
                [260, 500],
                [520, 540],
                [780, 490],
                [1040, 530],
                [1300, 480],
                [1460, 520],
              ]}
              fill={P.mtn[2]}
            />
            <Mist y={520} height={110} color={P.skyDawn[1]} opacity={0.45} />
          </>
        ),
      },
      {
        depth: 0.58,
        node: (
          <>
            <Hill
              bottom={880}
              points={[
                [-20, 640],
                [300, 600],
                [620, 580],
                [900, 560],
                [1200, 590],
                [1460, 560],
              ]}
              fill={P.mtn[3]}
            />
            <CocoaRows seed={11} x0={520} y0={560} />
          </>
        ),
      },
      {
        depth: 0.78,
        align: "xMaxYMax",
        motion: "sway",
        origin: at(1150, 830),
        node: (
          <>
            <CocoaTree x={1150} base={830} height={320} seed={7} />
            <Glow x={1150} y={360} rx={280} ry={150} opacity={0.4} />
          </>
        ),
      },
      ground(3),
      cornerLeaves("left"),
    ],
  },
  {
    id: "journey",
    copy: "right",
    layers: [
      { depth: 0, node: <Sky id={"sky-journey"} colors={P.skyDay} /> },
      ...sunLayers(1060, 170),
      cloudLayer(
        [
          [300, 140, 0.8],
          [760, 200, 0.6],
        ],
        9,
      ),
      {
        depth: 0.22,
        node: (
          <>
            <Palm x={300} y={470} h={190} lean={-10} />
            <Palm x={1020} y={460} h={210} lean={14} />
            <Hill
              bottom={670}
              points={[
                [-20, 470],
                [240, 420],
                [520, 450],
                [800, 400],
                [1080, 440],
                [1300, 410],
                [1460, 440],
              ]}
              fill={P.mtn[1]}
            />
            <Mist y={430} height={130} color={P.skyDay[1]} />
          </>
        ),
      },
      {
        depth: 0.38,
        node: (
          <>
            <Hill
              bottom={790}
              points={[
                [-20, 560],
                [300, 520],
                [620, 540],
                [960, 500],
                [1240, 530],
                [1460, 510],
              ]}
              fill={P.mtn[2]}
            />
            <CocoaRows seed={21} x0={-20} y0={548} cols={22} rows={2} />
            <Mist y={520} height={150} color={P.skyDay[1]} opacity={0.5} />
          </>
        ),
      },
      {
        depth: 0.58,
        node: (
          <Hill
            bottom={880}
            points={[
              [-20, 680],
              [360, 650],
              [760, 670],
              [1100, 640],
              [1460, 660],
            ]}
            fill={P.mtn[3]}
          />
        ),
      },
      {
        depth: 0.58,
        align: "xMinYMax",
        motion: "sway",
        origin: at(430, 700),
        delay: 2.2,
        node: (
          <>
            <CocoaTree
              x={430}
              base={700}
              height={250}
              seed={23}
              mirror={true}
            />
            <Glow x={440} y={340} rx={230} ry={120} opacity={0.38} />
          </>
        ),
      },
      {
        depth: 0.8,
        align: "xMinYMax",
        node: (
          <>
            <OpenPod x={420} y={735} angle={18} s={0.9} />
            <Basket x={220} y={790} s={1.05} />
          </>
        ),
      },
      ground(5),
      {
        depth: 1,
        align: "xMinYMax",
        motion: "sway",
        origin: at(60, 930),
        delay: 1.3,
        node: (
          <g transform={"translate(60,0) scale(1.5) translate(-60,0)"}>
            <CocoaTree x={60} base={620} height={380} seed={29} />
          </g>
        ),
      },
      cornerLeaves("left", 1.1),
      cornerLeaves("right", 2.7),
    ],
  },
  {
    id: "tools",
    copy: "center",
    layers: [
      { depth: 0, node: <Sky id={"sky-tools"} colors={P.skyDay} /> },
      ...sunLayers(720, 130),
      cloudLayer(
        [
          [260, 190, 0.9],
          [1180, 150, 0.75],
        ],
        17,
      ),
      flockLayer(250, 20),
      {
        depth: 0.2,
        node: (
          <>
            <Hill
              bottom={630}
              points={[
                [-20, 420],
                [220, 370],
                [480, 400],
                [760, 350],
                [1020, 390],
                [1260, 340],
                [1460, 380],
              ]}
              fill={P.mtn[0]}
            />
            <Mist y={380} height={130} color={P.skyDay[1]} />
          </>
        ),
      },
      {
        depth: 0.34,
        node: (
          <>
            <Palm x={160} y={510} h={170} lean={12} />
            <Palm x={1300} y={500} h={190} lean={-12} />
            <Hill
              bottom={750}
              points={[
                [-20, 520],
                [300, 480],
                [640, 500],
                [980, 470],
                [1260, 500],
                [1460, 480],
              ]}
              fill={P.mtn[1]}
            />
            <Mist y={470} height={160} color={P.skyDay[1]} />
          </>
        ),
      },
      {
        depth: 0.52,
        node: (
          <>
            <Hill
              bottom={830}
              points={[
                [-20, 640],
                [360, 610],
                [760, 630],
                [1100, 600],
                [1460, 620],
              ]}
              fill={P.mtn[2]}
            />
            <FermentBox x={70} y={560} w={190} />
            <FermentBox x={290} y={575} w={170} />
            <Sack x={1250} y={650} s={0.9} />
            <Sack x={1340} y={660} s={0.8} />
            <Mist y={600} height={110} color={P.skyDay[1]} opacity={0.35} />
          </>
        ),
      },
      {
        depth: 0.52,
        shadow: false,
        node: (
          <>
            <Steam x={165} y={548} seed={3} />
            <Steam x={375} y={563} seed={5} />
          </>
        ),
      },
      {
        depth: 0.74,
        node: (
          <>
            <Hill
              bottom={880}
              points={[
                [-20, 720],
                [480, 700],
                [960, 710],
                [1460, 690],
              ]}
              fill={P.mtn[3]}
            />
            <DryingRack x={120} y={690} w={360} seed={31} />
            <DryingRack x={540} y={700} w={380} seed={37} />
            <DryingRack x={980} y={690} w={360} seed={41} />
          </>
        ),
      },
      ground(7),
      cornerLeaves("left", 0.6),
      cornerLeaves("right", 2.1),
    ],
  },
  {
    id: "impact",
    copy: "left",
    layers: [
      {
        depth: 0,
        node: <Sky id={"sky-impact"} colors={["#fde3cf", "#f3e6ee"]} />,
      },
      ...sunLayers(1120, 300, "#ffc59e"),
      cloudLayer(
        [
          [420, 160, 0.85],
          [860, 120, 0.6],
        ],
        25,
      ),
      flockLayer(200, 33),
      {
        depth: 0.2,
        node: (
          <>
            <Hill
              bottom={670}
              points={[
                [-20, 450],
                [260, 400],
                [560, 430],
                [860, 380],
                [1160, 420],
                [1460, 390],
              ]}
              fill={P.mtn[0]}
            />
            {[600, 660, 720, 790, 860, 930].map((x, i) => (
              <House
                key={x}
                x={x}
                y={430 - (i % 2) * 6}
                s={0.6 + (i % 3) * 0.08}
              />
            ))}
            <Mist y={410} height={140} color={"#f3e6ee"} />
          </>
        ),
      },
      {
        depth: 0.38,
        node: (
          <>
            <Palm x={420} y={540} h={170} lean={-8} />
            <Hill
              bottom={810}
              points={[
                [-20, 560],
                [300, 520],
                [620, 545],
                [940, 510],
                [1240, 540],
                [1460, 520],
              ]}
              fill={P.mtn[2]}
            />
            <CocoaRows seed={47} x0={-10} y0={575} cols={9} rows={2} />
            <Mist y={510} height={180} color={"#f3e6ee"} opacity={0.5} />
          </>
        ),
      },
      {
        depth: 0.72,
        align: "xMaxYMax",
        node: (
          <>
            <Hill
              bottom={880}
              points={[
                [-20, 700],
                [400, 680],
                [800, 690],
                [1200, 670],
                [1460, 680],
              ]}
              fill={P.mtn[3]}
            />
            <Glow
              x={1100}
              y={600}
              rx={320}
              ry={170}
              color={"#ffe2c4"}
              opacity={0.45}
            />
            <Stall x={900} y={760} />
          </>
        ),
      },
      ground(9),
      cornerLeaves("left", 1.8),
    ],
  },
  {
    id: "contact",
    copy: "center",
    layers: [
      {
        depth: 0,
        node: <Sky id={"sky-contact"} colors={["#c9c3e0", "#f6d9cf"]} />,
      },
      {
        depth: 0.05,
        node: (
          <>
            <Stars seed={53} />
            <Glow x={1120} y={160} rx={170} color={"#fff4e0"} opacity={0.55} />
            <circle cx={1120} cy={160} r={46} fill={"#fff4e0"} />
            <circle cx={1138} cy={150} r={40} fill={"#c9c3e0"} />
          </>
        ),
      },
      cloudLayer(
        [
          [360, 210, 0.7],
          [760, 150, 0.5],
        ],
        12,
      ),
      {
        depth: 0.15,
        node: (
          <>
            <Hill
              bottom={650}
              points={[
                [-20, 470],
                [200, 410],
                [460, 450],
                [740, 390],
                [1000, 440],
                [1260, 400],
                [1460, 430],
              ]}
              fill={shade(P.mtn[0], -0.04)}
            />
            <Mist y={420} height={140} color={"#f6d9cf"} />
          </>
        ),
      },
      {
        depth: 0.3,
        node: (
          <>
            <Palm x={260} y={540} h={180} lean={10} />
            <Palm x={1180} y={530} h={200} lean={-10} />
            <Hill
              bottom={740}
              points={[
                [-20, 540],
                [300, 500],
                [640, 530],
                [980, 490],
                [1300, 520],
                [1460, 500],
              ]}
              fill={shade(P.mtn[1], -0.06)}
            />
            <Mist y={490} height={150} color={"#f6d9cf"} />
          </>
        ),
      },
      {
        depth: 0.5,
        node: (
          <>
            <Hill
              bottom={830}
              points={[
                [-20, 630],
                [360, 600],
                [760, 620],
                [1100, 590],
                [1460, 610],
              ]}
              fill={shade(P.mtn[2], -0.08)}
            />
            <CocoaRows seed={59} x0={380} y0={600} cols={11} rows={2} />
            <Mist y={590} height={120} color={"#f6d9cf"} opacity={0.35} />
          </>
        ),
      },
      { depth: 0.6, shadow: false, node: <Fireflies seed={67} /> },
      {
        depth: 0.78,
        align: "xMinYMax",
        motion: "sway",
        origin: at(186, 760),
        delay: 0.8,
        node: (
          <CocoaTree x={170} base={760} height={280} seed={61} mirror={true} />
        ),
      },
      {
        depth: 0.78,
        align: "xMaxYMax",
        motion: "sway",
        origin: at(1240, 720),
        delay: 3.1,
        node: <Sapling x={1240} y={720} s={1.2} />,
      },
      {
        depth: 1,
        node: (
          <Hill
            points={[
              [-20, 720],
              [400, 700],
              [800, 715],
              [1200, 695],
              [1460, 710],
            ]}
            fill={shade(P.fg, -0.05)}
          />
        ),
      },
    ],
  },
];

export { type CopySide, type PaperLayer, paperScenes };
