import manifest from "./rasterManifest.json";

// Static landing-page layers are shipped as pre-rendered images instead of
// live SVG (see SceneBackdrop's Layer). A live layer is thousands of paths
// plus SVG drop-shadow filters, re-rasterized by the browser tile by tile
// whenever a scene comes on screen; on slower machines tiles weren't ready
// in time and showed blank or blurred mid-scroll. An image is decoded once,
// off the main thread.
//
// Regenerate after changing any scene art: `pnpm papercut:export` (needs
// `pnpm dev` running), which rewrites public/images/papercut/*.webp and
// rasterManifest.json.

// Pixels per viewBox unit in the exported images (the frame is 1440x810).
const PAPERCUT_SCALE = 1.5;

// Where an image sits, in the layer's own 1440x810 viewBox units.
interface RasterBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

const rasterKey = (sceneId: string, layerIndex: number) =>
  `${sceneId}-${layerIndex}`;

const rasters = manifest as Record<string, RasterBounds>;

function rasterFor(sceneId: string, layerIndex: number) {
  const key = rasterKey(sceneId, layerIndex);
  const bounds = rasters[key];
  return bounds ? { src: `/images/papercut/${key}.webp`, bounds } : null;
}

export { PAPERCUT_SCALE, rasterFor, rasterKey };
export type { RasterBounds };
