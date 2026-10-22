import { describe, expect, it, vi } from "vitest";

import WithNavFarmerLayout from "@/app/(with-nav-farmer)/layout";
import { serverAuthApi } from "@/core/api/serverAuthApi";
import AuthWrapper from "@/providers/wrapper/AuthWrapper";

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: () => ({ value: "x" }) })),
}));
// redirect() never returns in Next -- it throws to stop rendering.
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));
vi.mock("@/core/api/serverAuthApi", () => ({
  serverAuthApi: { authMe: vi.fn() },
}));

// Runs the AuthWrapper the layout builds, with the props it gives it.
async function openHistoryAs(roles: string[]) {
  vi.mocked(serverAuthApi.authMe).mockResolvedValue({
    roles,
  } as unknown as Awaited<ReturnType<typeof serverAuthApi.authMe>>);
  const element = WithNavFarmerLayout({ children: null });
  return AuthWrapper(element.props);
}

// docs-and-plan#245: /history is the farmer's own submissions -- the API
// behind it refuses everyone else, so the page itself is farmers only.
describe("(with-nav-farmer) layout", () => {
  it("sends a researcher who types /history to the dashboard", async () => {
    await expect(openHistoryAs(["researcher"])).rejects.toThrow(
      "REDIRECT:/dashboard",
    );
  });

  it("sends an admin to the dashboard too", async () => {
    await expect(openHistoryAs(["admin"])).rejects.toThrow(
      "REDIRECT:/dashboard",
    );
  });

  it("lets a farmer in", async () => {
    await expect(openHistoryAs(["farmer"])).resolves.toBeTruthy();
  });
});
