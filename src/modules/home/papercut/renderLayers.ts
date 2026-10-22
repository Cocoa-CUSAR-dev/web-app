import type { LayerArtPart } from "./LayerArt";
import { type PaperLayer, paperScenes } from "./scenes";

interface RenderLayer extends PaperLayer {
  parts: LayerArtPart[];
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

export { renderScenes };
export type { RenderLayer };
