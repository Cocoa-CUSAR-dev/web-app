import { palette } from "./papercut/palette";

const homeScenes = [
  { id: "home", label: "Home" },
  { id: "journey", label: "The Journey" },
  { id: "tools", label: "Our Tools" },
  { id: "impact", label: "Impact" },
  { id: "contact", label: "Contact" },
] as const;

// Near-opaque on purpose: at lower opacity the scene's small cocoa trees and
// palms showed through behind body text. No backdrop-filter: blurring the
// moving scenes behind every panel each frame halved the scroll frame rate.
const glassPanelSx = {
  background: "rgba(255, 252, 246, 0.94)",
  border: "1px solid rgba(255, 255, 255, 0.9)",
  borderRadius: "1.5rem",
  boxShadow: "0 1.25rem 2.5rem rgba(35, 54, 44, 0.12)",
} as const;

const displayFont = "var(--bai-jamjuree), serif";

// On desktop each chapter is taller than the viewport and its content is
// pinned (sticky) while the scene behind keeps moving -- this is the dwell
// time that lets a chapter breathe before the camera pans to the next one.
const pinnedHeight = "175dvh";

const ink = palette.ink;
const inkSoft = "#33453c";
const accent = palette.accent;

export {
  accent,
  displayFont,
  glassPanelSx,
  homeScenes,
  ink,
  inkSoft,
  pinnedHeight,
};
