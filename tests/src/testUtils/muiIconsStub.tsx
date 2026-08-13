// Stand-in for `@mui/icons-material` used only in tests (aliased in
// vitest.config.ts). The real package barrel re-exports ~2000 individual
// icon files; importing it as-is reliably hits EMFILE ("too many open
// files") under Vitest on Windows. None of our unit tests assert on icon
// SVG content, so a lightweight stub per icon name is sufficient - add an
// entry here the first time a newly-tested component needs one.
import type { SvgIconProps } from "@mui/material/SvgIcon";

function makeIconStub(name: string) {
  function IconStub(props: SvgIconProps) {
    return <svg data-icon={name} {...props} />;
  }
  IconStub.displayName = name;
  return IconStub;
}

export const ChevronLeft = makeIconStub("ChevronLeft");
export const ChevronRight = makeIconStub("ChevronRight");
export const ArrowBackIosNew = makeIconStub("ArrowBackIosNew");
export const HomeRounded = makeIconStub("HomeRounded");
export const CheckRounded = makeIconStub("CheckRounded");
export const CloseRounded = makeIconStub("CloseRounded");
export const InfoRounded = makeIconStub("InfoRounded");
export const WarningRounded = makeIconStub("WarningRounded");
export const NavigateBeforeRounded = makeIconStub("NavigateBeforeRounded");
export const NavigateNextRounded = makeIconStub("NavigateNextRounded");
export const Visibility = makeIconStub("Visibility");
export const VisibilityOff = makeIconStub("VisibilityOff");
export const PermIdentityRounded = makeIconStub("PermIdentityRounded");
export const HelpRounded = makeIconStub("HelpRounded");
export const MenuRounded = makeIconStub("MenuRounded");
export const ErrorOutlineRounded = makeIconStub("ErrorOutlineRounded");
export const Search = makeIconStub("Search");
