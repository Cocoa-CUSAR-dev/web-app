import { MapType } from "../types";

const mapStyles: MapType[] = [
  {
    name: "Open Street Map",
    style:
      "https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/openStreetMap.json",
  },
  {
    name: "ArcGIS Hybrid",
    style:
      "https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/arcgis_hybrid.json",
  },
  {
    name: "Dark Matter",
    style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  },
  {
    name: "Dark Matter No Labels",
    style:
      "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json",
  },
  {
    name: "Positron",
    style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  },
  {
    name: "Positron No Labels",
    style:
      "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json",
  },
  {
    name: "Voyager",
    style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  },
  {
    name: "Voyager No Labels",
    style:
      "https://basemaps.cartocdn.com/gl/voyager-nolabels-gl-style/style.json",
  },
] as const;

const defaultMap = mapStyles[0];

export { defaultMap, mapStyles };
