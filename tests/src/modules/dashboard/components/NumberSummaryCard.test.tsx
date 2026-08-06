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

  it("BUG: double-negates a negative secondary value ('-' prefix + the already-negative number)", async () => {
    // `(secondaryValue >= 0 ? "+" : "-") + secondaryValue` prepends "-" and
    // then concatenates the already-negative number, e.g. -5 renders as
    // "--5" instead of "-5".
    const onLoadData = vi
      .fn()
      .mockResolvedValueOnce(120)
      .mockResolvedValueOnce(-5);

    render(
      <NumberSummaryCard title="Total Harvest" onLoadData={onLoadData} />,
    );

    expect(await screen.findByText(/^--5/)).toBeInTheDocument();
  });

  it("BUG: never leaves the loading state if either resolved value is 0 (falsy check, not null check)", async () => {
    const onLoadData = vi
      .fn()
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(5);

    render(
      <NumberSummaryCard title="Total Harvest" onLoadData={onLoadData} />,
    );

    await waitFor(() => expect(onLoadData).toHaveBeenCalledTimes(2));
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.queryByText("Total Harvest")).toBeNull();
  });
});
