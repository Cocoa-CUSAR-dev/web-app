"use client";

import { useLayoutEffect, useRef, useState } from "react";

import LayerArt from "@/modules/home/papercut/LayerArt";
import {
  PAPERCUT_SCALE,
  type RasterBounds,
  rasterKey,
} from "@/modules/home/papercut/raster";
import { renderScenes } from "@/modules/home/papercut/renderLayers";

// Not a page anyone visits: scripts/export-papercut.mjs opens it, waits for
// window.__papercut, and screenshots each [data-papercut] element into
// public/images/papercut/. Every static landing-page layer is drawn here alone
// on a transparent background, at PAPERCUT_SCALE, cropped to what it really
// covers -- hills reach well past the 1440x810 frame so the camera can pan.

// Shadows aren't part of getBBox; leave room for the deepest one.
const SHADOW_PAD = 48;
// The camera never pans further than this past the frame, so art beyond it
// is never seen and needn't be shipped.
const MAX_X: [number, number] = [-360, 1800];
const MAX_Y: [number, number] = [-240, 900];

const staticLayers = renderScenes.flatMap((scene) =>
  scene.layers.flatMap((layer, index) =>
    !layer.motion && layer.depth !== 0
      ? [{ key: rasterKey(scene.id, index), layer }]
      : [],
  ),
);

function ExportLayer({
  exportKey,
  layer,
  onMeasured,
}: {
  exportKey: string;
  layer: (typeof staticLayers)[number]["layer"];
  onMeasured: (key: string, bounds: RasterBounds) => void;
}) {
  const art = useRef<SVGGElement>(null);
  const [bounds, setBounds] = useState<RasterBounds | null>(null);

  useLayoutEffect(() => {
    const box = art.current!.getBBox();
    const x = Math.max(MAX_X[0], Math.floor(box.x - SHADOW_PAD));
    const y = Math.max(MAX_Y[0], Math.floor(box.y - SHADOW_PAD));
    const right = Math.min(MAX_X[1], Math.ceil(box.x + box.width + SHADOW_PAD));
    const bottom = Math.min(
      MAX_Y[1],
      Math.ceil(box.y + box.height + SHADOW_PAD),
    );
    const measured = { x, y, width: right - x, height: bottom - y };
    setBounds(measured);
    onMeasured(exportKey, measured);
  }, [exportKey, onMeasured]);

  const view = bounds ?? { x: -800, y: -400, width: 3040, height: 1610 };
  return (
    <svg
      data-papercut={exportKey}
      viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
      // Whole pixels, with a gap below: a fractional height leaves the next
      // element on a half pixel, and its screenshot then picks up a row of
      // this one -- a faint line along the image edge on the landing page.
      width={Math.round(view.width * PAPERCUT_SCALE)}
      height={Math.round(view.height * PAPERCUT_SCALE)}
      style={{
        marginBottom: 16,
        display: "block",
        overflow: "hidden",
        background: "transparent",
      }}
    >
      <g ref={art}>
        <LayerArt parts={layer.parts} idPrefix={exportKey.replace(/\W/g, "")} />
      </g>
    </svg>
  );
}

const measured: Record<string, RasterBounds> = {};
function recordBounds(key: string, bounds: RasterBounds) {
  measured[key] = bounds;
  if (Object.keys(measured).length === staticLayers.length) {
    (window as unknown as { __papercut: object }).__papercut = measured;
  }
}

export default function PapercutExport() {
  return (
    <div style={{ background: "transparent" }}>
      {staticLayers.map(({ key, layer }) => (
        <ExportLayer
          key={key}
          exportKey={key}
          layer={layer}
          onMeasured={recordBounds}
        />
      ))}
    </div>
  );
}
