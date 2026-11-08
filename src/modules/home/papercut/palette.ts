// "Dawn Pastel" -- the palette picked for the home page paper-cut scenes.
const palette = {
  skyDawn: ["#fde8da", "#e6eef2"],
  skyDay: ["#fdf3e4", "#e3eef0"],
  skyDusk: ["#f6d9cf", "#d9d4e8"],
  sun: "#ffd3a8",
  cloud: "#ffffff",
  mtn: ["#dfdcec", "#c2d3dc", "#9cc0b2", "#6f9f84"],
  fg: "#2c5a3f",
  fg2: "#3b6e4c",
  leaf: ["#2c5a3f", "#3b6e4c", "#4f8a5c"],
  young: "#c0705a",
  trunk: "#6b4a3a",
  trunkDark: "#4d3328",
  palm: "#5b8a6a",
  wood: "#b98a62",
  woodDark: "#8a6246",
  bean: "#7a4a35",
  pulp: "#fbf6ee",
  chocolate: "#5a3426",
  wrapper: ["#e9a99b", "#9cc0b2", "#f2d39c", "#c2b8dc"],
  ink: "#23362c",
  sub: "#4a5e55",
  accent: "#3b7d55",
  podColors: ["#86ad45", "#e3b236", "#d9822b", "#a8433a", "#c99a2e"],
} as const;

function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v + 255 * amount)));
  return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`;
}

export { palette, shade };
