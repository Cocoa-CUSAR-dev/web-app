import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthInfo } from "@/hooks/useAuthInfo";
import ClientAuthInfoProvider from "@/providers/wrapper/ClientAuthInfoProvider";

function LoginState() {
  const { isAuthenticated } = useAuthInfo();
  return <span>{isAuthenticated ? "signed-in" : "anonymous"}</span>;
}

function renderPage() {
  return render(
    <ClientAuthInfoProvider>
      <LoginState />
    </ClientAuthInfoProvider>,
  );
}

describe("ClientAuthInfoProvider", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the anonymous version straight away, then the signed-in one", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          value: { email: "r@test.com", roles: ["researcher"] },
        }),
        {
          status: 200,
        },
      ),
    );

    renderPage();

    // Rendered before the check answers -- nothing waits on the backend.
    expect(screen.getByText("anonymous")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("signed-in")).toBeInTheDocument(),
    );
    expect(fetch).toHaveBeenCalledWith("/api/v1/auth/me", expect.anything());
  });

  it("stays anonymous for a visitor who isn't signed in", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ value: null }), { status: 200 }),
    );

    renderPage();

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.getByText("anonymous")).toBeInTheDocument();
  });

  it("stays anonymous when the check fails", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("offline"));

    renderPage();

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.getByText("anonymous")).toBeInTheDocument();
  });
});
