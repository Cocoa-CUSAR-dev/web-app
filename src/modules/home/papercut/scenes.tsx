import type { ReactNode } from "react";

import { palette as P, shade } from "./palette";
import {
  Bird,
  Cloud,
  CocoaRows,
  CocoaTree,
  Grass,
  Hill,
  Leaf,
  Palm,
  Sky,
} from "./primitives";
import {
  Basket,
  DryingRack,
  FermentBox,
  OpenPod,
  Sack,
  Sapling,
  Stall,
  Stars,
} from "./props";

interface PaperLayer {
  // 0 = sky (static), 1 = nearest foreground (moves most).
  depth: number;
  // Which edge stays in frame when the viewport is narrower than 16:9.
  align?: "xMinYMax" | "xMidYMid" | "xMaxYMax";
  node: ReactNode;
}

function CornerLeaves({ side }: { side: "left" | "right" | "both" }) {
  const left = (
    <>
      <Leaf x={-30} y={-20} angle={70} len={260} fill={P.fg} />
      <Leaf x={20} y={-40} angle={58} len={230} fill={P.fg2} />
      <Leaf x={-40} y={60} angle={40} len={210} fill={P.leaf[1]} />
      <Leaf x={90} y={-30} angle={95} len={180} fill={P.young} width={0.85} />
    </>
  );
  const right = (
    <g transform={"translate(1440,0) scale(-1,1)"}>
      <Leaf x={-30} y={-30} angle={75} len={240} fill={P.fg2} />
      <Leaf x={30} y={-40} angle={60} len={200} fill={P.leaf[2]} />
      <Leaf x={-30} y={70} angle={42} len={190} fill={P.fg} />
    </g>
  );
  return (
    <>
      {side !== "right" && left}
      {side !== "left" && right}
    </>
  );
}

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

const foreground = (seed: number, side: "left" | "right" | "both") => (
  <>
    <Hill
      points={[
        [-20, 760],
        [360, 730],
        [760, 770],
        [1100, 740],
        [1460, 770],
      ]}
      fill={P.fg2}
    />
    <Grass seed={seed} y={790} color1={P.fg} color2={P.fg2} />
    <CornerLeaves side={side} />
  </>
);

const paperScenes: { id: string; layers: PaperLayer[] }[] = [
  {
    id: "home",
    layers: [
      { depth: 0, node: <Sky id={"sky-home"} colors={P.skyDawn} /> },
      {
        depth: 0.08,
        node: (
          <>
            <circle cx={1050} cy={190} r={150} fill={P.sun} opacity={0.25} />
            <circle cx={1050} cy={190} r={105} fill={P.sun} opacity={0.45} />
            <circle cx={1050} cy={190} r={66} fill={P.sun} />
            <Cloud x={300} y={150} />
            <Cloud x={820} y={110} s={0.7} />
            <Cloud x={1300} y={260} s={0.8} />
          </>
        ),
      },
      {
        depth: 0.18,
        node: (
          <Hill
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
        ),
      },
      {
        depth: 0.3,
        node: (
          <>
            <Hill
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
            <Bird x={760} y={230} />
            <Bird x={800} y={250} s={0.8} />
            <Bird x={730} y={262} s={0.7} />
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
          </>
        ),
      },
      {
        depth: 0.58,
        node: (
          <>
            <Hill
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
        node: <CocoaTree x={1150} base={830} height={320} seed={7} />,
      },
      { depth: 1, node: foreground(3, "left") },
    ],
  },
  {
    id: "journey",
    layers: [
      { depth: 0, node: <Sky id={"sky-journey"} colors={P.skyDay} /> },
      {
        depth: 0.1,
        node: (
          <>
            <circle cx={380} cy={170} r={60} fill={P.sun} />
            <circle cx={380} cy={170} r={100} fill={P.sun} opacity={0.35} />
            <Cloud x={760} y={140} s={0.8} />
            <Cloud x={1240} y={200} s={0.6} />
          </>
        ),
      },
      {
        depth: 0.22,
        node: (
          <>
            <Palm x={300} y={470} h={190} lean={-10} />
            <Palm x={1020} y={460} h={210} lean={14} />
            <Hill
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
          </>
        ),
      },
      {
        depth: 0.38,
        node: (
          <>
            <Hill
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
          </>
        ),
      },
      {
        depth: 0.58,
        align: "xMaxYMax",
        node: (
          <>
            <Hill
              points={[
                [-20, 680],
                [360, 650],
                [760, 670],
                [1100, 640],
                [1460, 660],
              ]}
              fill={P.mtn[3]}
            />
            <CocoaTree x={980} base={700} height={250} seed={23} />
          </>
        ),
      },
      {
        depth: 0.8,
        align: "xMaxYMax",
        node: (
          <>
            <OpenPod x={1010} y={735} angle={-18} s={0.9} />
            <Basket x={1210} y={790} s={1.05} />
          </>
        ),
      },
      {
        depth: 1,
        align: "xMaxYMax",
        node: (
          <>
            {foreground(5, "both")}
            <g transform={"translate(1380,0) scale(1.5) translate(-1380,0)"}>
              <CocoaTree
                x={1380}
                base={620}
                height={380}
                seed={29}
                mirror={true}
              />
            </g>
          </>
        ),
      },
    ],
  },
  {
    id: "tools",
    layers: [
      { depth: 0, node: <Sky id={"sky-tools"} colors={P.skyDay} /> },
      {
        depth: 0.08,
        node: (
          <>
            <circle cx={720} cy={130} r={120} fill={P.sun} opacity={0.3} />
            <circle cx={720} cy={130} r={70} fill={P.sun} />
            <Cloud x={260} y={190} s={0.9} />
            <Cloud x={1180} y={150} s={0.75} />
          </>
        ),
      },
      {
        depth: 0.2,
        node: (
          <Hill
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
        ),
      },
      {
        depth: 0.34,
        node: (
          <>
            <Palm x={160} y={510} h={170} lean={12} />
            <Palm x={1300} y={500} h={190} lean={-12} />
            <Hill
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
          </>
        ),
      },
      {
        depth: 0.52,
        node: (
          <>
            <Hill
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
          </>
        ),
      },
      {
        depth: 0.74,
        node: (
          <>
            <Hill
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
      { depth: 1, node: foreground(7, "both") },
    ],
  },
  {
    id: "impact",
    layers: [
      {
        depth: 0,
        node: <Sky id={"sky-impact"} colors={["#fde3cf", "#f3e6ee"]} />,
      },
      {
        depth: 0.08,
        node: (
          <>
            <circle cx={1120} cy={300} r={150} fill={"#ffc59e"} opacity={0.3} />
            <circle cx={1120} cy={300} r={84} fill={"#ffc59e"} />
            <Cloud x={420} y={160} s={0.85} />
            <Cloud x={860} y={120} s={0.6} />
          </>
        ),
      },
      {
        depth: 0.2,
        node: (
          <>
            <Hill
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
          </>
        ),
      },
      {
        depth: 0.38,
        node: (
          <>
            <Palm x={420} y={540} h={170} lean={-8} />
            <Hill
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
          </>
        ),
      },
      {
        depth: 0.72,
        align: "xMaxYMax",
        node: (
          <>
            <Hill
              points={[
                [-20, 700],
                [400, 680],
                [800, 690],
                [1200, 670],
                [1460, 680],
              ]}
              fill={P.mtn[3]}
            />
            <Stall x={900} y={760} />
          </>
        ),
      },
      { depth: 1, node: foreground(9, "left") },
    ],
  },
  {
    id: "contact",
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
            <circle cx={1120} cy={160} r={46} fill={"#fff4e0"} />
            <circle cx={1138} cy={150} r={40} fill={"#c9c3e0"} />
          </>
        ),
      },
      {
        depth: 0.15,
        node: (
          <Hill
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
        ),
      },
      {
        depth: 0.3,
        node: (
          <>
            <Palm x={260} y={540} h={180} lean={10} />
            <Palm x={1180} y={530} h={200} lean={-10} />
            <Hill
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
          </>
        ),
      },
      {
        depth: 0.5,
        node: (
          <>
            <Hill
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
          </>
        ),
      },
      {
        depth: 0.78,
        align: "xMinYMax",
        node: (
          <>
            <CocoaTree
              x={170}
              base={760}
              height={280}
              seed={61}
              mirror={true}
            />
            <Sapling x={1240} y={720} s={1.2} />
          </>
        ),
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

export { type PaperLayer, paperScenes };
