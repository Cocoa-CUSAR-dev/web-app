"use client";

import EnergySavingsLeafOutlined from "@mui/icons-material/EnergySavingsLeafOutlined";
import { ButtonBase, Typography } from "@mui/material";

import { accent, ink } from "../homeScenes";

interface LiteModeToggleProps {
  lite: boolean;
  onChange: (lite: boolean) => void;
}

// Lets the visitor pick lite mode themselves: auto-detection judges frame
// rate, but a machine can keep up and still run hot.
function LiteModeToggle({ lite, onChange }: LiteModeToggleProps) {
  return (
    <ButtonBase
      onClick={() => onChange(!lite)}
      aria-pressed={lite}
      title={
        lite
          ? "Lite mode: less animation, easier on the battery. Click for full."
          : "Switch to lite mode: less animation, easier on the battery."
      }
      sx={{
        position: "absolute",
        left: "1rem",
        bottom: "1rem",
        zIndex: 2,
        gap: 0.75,
        padding: "0.35rem 0.75rem",
        borderRadius: "999px",
        background: "rgba(253,243,228,0.85)",
        border: `1px solid ${lite ? accent : "rgba(43,26,14,0.15)"}`,
        color: lite ? accent : ink,
      }}
    >
      <EnergySavingsLeafOutlined sx={{ fontSize: "1rem" }} />
      <Typography variant={"caption"} fontWeight={600}>
        {lite ? "Lite mode on" : "Lite mode"}
      </Typography>
    </ButtonBase>
  );
}

export default LiteModeToggle;
