import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import MonthlyVerticalBarChartByYear from "@/modules/dashboard/components/MonthlyVerticalBarChartByYear";

// react-chartjs-2's <Bar> needs a real canvas context, which jsdom doesn't
// implement. The chart's own rendering isn't under test here - only the
// year-selection/data-loading logic around it - so stub it out.
vi.mock("react-chartjs-2", () => ({
  Bar: () => <div data-testid="bar-chart" />,
}));

describe("MonthlyVerticalBarChartByYear", () => {
  beforeEach(() => {
    vi.setSystemTime(new Date(2024, 5, 1));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("offers the last N years (including the current one) as toggle options", () => {
    render(<MonthlyVerticalBarChartByYear title="Harvest" numYear={4} />);

    for (const year of ["2024", "2023", "2022", "2021"]) {
      expect(screen.getByRole("button", { name: year })).toBeInTheDocument();
    }
  });

  it("loads data for the full current year on mount", async () => {
    const onLoadData = vi.fn().mockResolvedValue(undefined);

    render(
      <MonthlyVerticalBarChartByYear
        title="Harvest"
        onLoadData={onLoadData}
      />,
    );

    await waitFor(() => {
      // FE-6: a 5th AbortSignal arg now rides along so the caller can
      // cancel a stale request -- this test only cares that the year
      // range is right, so match "any signal" rather than a specific one.
      expect(onLoadData).toHaveBeenCalledWith(
        1,
        2024,
        12,
        2024,
        expect.any(AbortSignal),
      );
    });
  });

  it("disables navigating to a future year but allows navigating to a past year", () => {
    render(<MonthlyVerticalBarChartByYear title="Harvest" numYear={4} />);

    const buttons = screen.getAllByRole("button");
    const prevYearButton = buttons[0];
    const nextYearButton = buttons[buttons.length - 1];

    expect(nextYearButton).toBeDisabled();
    expect(prevYearButton).not.toBeDisabled();
  });

  it("switches the selected year and reloads data when a toggle option is clicked", async () => {
    const onLoadData = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <MonthlyVerticalBarChartByYear
        title="Harvest"
        numYear={4}
        onLoadData={onLoadData}
      />,
    );
    await waitFor(() =>
      expect(onLoadData).toHaveBeenCalledWith(
        1,
        2024,
        12,
        2024,
        expect.any(AbortSignal),
      ),
    );
    onLoadData.mockClear();

    await user.click(screen.getByRole("button", { name: "2023" }));

    await waitFor(() => {
      expect(onLoadData).toHaveBeenCalledWith(
        1,
        2023,
        12,
        2023,
        expect.any(AbortSignal),
      );
    });
  });

  it("renders nothing when numYear is less than 1", () => {
    const { container } = render(
      <MonthlyVerticalBarChartByYear title="Harvest" numYear={0} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
