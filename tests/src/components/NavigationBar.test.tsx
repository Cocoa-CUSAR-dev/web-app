import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import NavigationBar from "@/components/NavigationBar";
import { useAuthInfo } from "@/hooks/useAuthInfo";

vi.mock("@/hooks/useAuthInfo", () => ({
  useAuthInfo: vi.fn(),
}));

// Not under test here, and each pulls in its own context (router, joyride).
vi.mock("@/components/ProfileMenu", () => ({
  default: () => null,
}));
vi.mock("@/components/utility/UnControlledRerunableTutorial", () => ({
  default: () => null,
}));

function renderAs(roles: string[]) {
  vi.mocked(useAuthInfo).mockReturnValue({
    roles,
  } as unknown as ReturnType<typeof useAuthInfo>);
  return render(
    <NavigationBar>
      <div />
    </NavigationBar>,
  );
}

// docs-and-plan#245: /history is the farmer's own submissions (its API needs
// read:response:own, a farmer-only permission), so the link is only for
// farmers -- in the desktop bar and in the mobile drawer alike.
describe("NavigationBar History link", () => {
  it("is hidden from a researcher", async () => {
    renderAs(["researcher"]);
    expect(screen.queryByText("History")).not.toBeInTheDocument();

    await userEvent.click(
      document.getElementById("navbar-mobile-menu-button")!,
    );
    expect(screen.queryByText("History")).not.toBeInTheDocument();
  });

  it("is hidden from an admin", () => {
    renderAs(["admin"]);
    expect(screen.queryByText("History")).not.toBeInTheDocument();
  });

  it("is shown to a farmer, in the bar and in the mobile menu", async () => {
    renderAs(["farmer"]);
    expect(screen.getAllByText("History")).toHaveLength(1);

    await userEvent.click(
      document.getElementById("navbar-mobile-menu-button")!,
    );
    expect(screen.getAllByText("History")).toHaveLength(2);
  });
});
