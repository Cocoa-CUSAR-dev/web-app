import type { ReactNode } from "react";

interface LayerArtPart {
  depth: number;
  shadow: boolean;
  node: ReactNode;
}

// The sheets of one scene layer, each with its paper shadow: nearer sheets
// sit further above the ones behind, so they cast longer, softer, darker
// shadows. Shared by SceneBackdrop (live SVG for the layers that move) and
// the raster export (scripts/export-papercut.mjs), so a layer looks the same
// whether it's drawn live or shipped as an image.
function LayerArt({
  parts,
  idPrefix,
}: {
  parts: LayerArtPart[];
  idPrefix: string;
}) {
  return (
    <>
      {parts.map((part, i) => {
        const hasShadow = part.shadow && part.depth >= 0.3;
        const id = `paper-shadow-${idPrefix}-${i}`;
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
    </>
  );
}

export default LayerArt;
export type { LayerArtPart };
