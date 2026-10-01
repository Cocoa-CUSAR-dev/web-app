import { palette } from "./papercut/palette";

const homeScenes = [
  { id: "home", label: "Home" },
  { id: "journey", label: "The Journey" },
  { id: "tools", label: "Our Tools" },
  { id: "impact", label: "Impact" },
  { id: "contact", label: "Contact" },
] as const;

const glassPanelSx = {
  background: "rgba(255, 255, 255, 0.62)",
  backdropFilter: "blur(16px) saturate(1.2)",
  WebkitBackdropFilter: "blur(16px) saturate(1.2)",
  border: "1px solid rgba(255, 255, 255, 0.8)",
  borderRadius: "1.5rem",
  boxShadow: "0 1.25rem 2.5rem rgba(35, 54, 44, 0.12)",
} as const;

const displayFont = "var(--bai-jamjuree), serif";

const ink = palette.ink;
const inkSoft = palette.sub;
const accent = palette.accent;

export { accent, displayFont, glassPanelSx, homeScenes, ink, inkSoft };
