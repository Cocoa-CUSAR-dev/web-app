import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import NumberSummaryCard from "@/modules/dashboard/components/NumberSummaryCard";

describe("NumberSummaryCard", () => {
  beforeEach(() => {
    vi.setSystemTime(new Date(2024, 0, 15));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows a loading spinner before onLoadData resolves", () => {
    const onLoadData = vi.fn(() => new Promise<number>(() => {}));

    render(<NumberSummaryCard title="Total Harvest" onLoadData={onLoadData} />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("requests the all-time total and the trailing-interval total with today's date", async () => {
    const onLoadData = vi.fn().mockResolvedValue(10);

    render(
      <NumberSummaryCard
        title="Total Harvest"
        interval={7}
        onLoadData={onLoadData}
      />,
    );

    await waitFor(() => {
      expect(onLoadData).toHaveBeenCalledTimes(2);
    });
    expect(onLoadData).toHaveBeenNthCalledWith(1, "1970-01", "2024-01-15");
    expect(onLoadData).toHaveBeenNthCalledWith(2, "2024-01-08", "2024-01-15");
  });

  it("renders the title, primary value, and signed secondary value once loaded", async () => {
    const onLoadData = vi
      .fn()
      .mockResolvedValueOnce(120)
      .mockResolvedValueOnce(15);

    render(
      <NumberSummaryCard
        title="Total Harvest"
        interval={7}
        unit="kg"
        onLoadData={onLoadData}
      />,
    );

    await screen.findByText("Total Harvest");
    expect(screen.getByText("120kg")).toBeInTheDocument();
    expect(
      screen.getByText("+15 kgin the past 7 days"),
    ).toBeInTheDocument();
  });

  it.fails(
    "does not double-negate a negative secondary value (currently renders '--5' instead of '-5', see BUG note in test.md)",
    async () => {
      // `(secondaryValue >= 0 ? "+" : "-") + secondaryValue` prepends "-"
      // and then concatenates the already-negative number.
      const onLoadData = vi
        .fn()
        .mockResolvedValueOnce(120)
        .mockResolvedValueOnce(-5);

      render(
        <NumberSummaryCard title="Total Harvest" onLoadData={onLoadData} />,
      );

      expect(await screen.findByText(/^-5/)).toBeInTheDocument();
    },
  );

  it.fails(
    "leaves the loading state once both values resolve, even when a value is 0 (currently stuck loading forever, see BUG note in test.md)",
    async () => {
      // The loading check `!primaryValue || !secondaryValue` treats a
      // resolved 0 the same as "not loaded yet" (0 is falsy), so the card
      // never renders its content when either count is legitimately zero.
      const onLoadData = vi
        .fn()
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(5);

      render(
        <NumberSummaryCard title="Total Harvest" onLoadData={onLoadData} />,
      );

      await screen.findByText("Total Harvest", {}, { timeout: 500 });
    },
  );
});
