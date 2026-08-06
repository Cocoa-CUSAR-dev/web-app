import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { describe, expect, it, vi } from "vitest";

import CustomBreadcrumbs from "@/components/CustomBreadcrumbs";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

describe("CustomBreadcrumbs", () => {
  it("title-cases each breadcrumb segment", () => {
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);

    render(<CustomBreadcrumbs breadcrumbs={["dashboard", "map"]} />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Map")).toBeInTheDocument();
  });

  it("links every breadcrumb except the last to its cumulative path", () => {
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);

    render(<CustomBreadcrumbs breadcrumbs={["dashboard", "map", "detail"]} />);

    expect(screen.getByText("Dashboard").closest("a")).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getByText("Map").closest("a")).toHaveAttribute(
      "href",
      "/dashboard/map",
    );
    expect(screen.getByText("Detail").closest("a")).not.toHaveAttribute(
      "href",
    );
  });

  it("navigates home when the default home icon is clicked", async () => {
    const push = vi.fn();
    vi.mocked(useRouter).mockReturnValue({
      push,
    } as unknown as ReturnType<typeof useRouter>);
    const user = userEvent.setup();

    render(<CustomBreadcrumbs breadcrumbs={["dashboard"]} />);
    await user.click(screen.getByRole("button"));

    expect(push).toHaveBeenCalledWith("/");
  });

  it("renders a custom icon instead of the default home button when provided", () => {
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);

    render(
      <CustomBreadcrumbs
        breadcrumbs={["dashboard"]}
        icon={<span data-testid="custom-icon" />}
      />,
    );

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
