import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SlidingPagination } from "@/components/table/SlidingPagination";

function pageNumbers() {
  return screen
    .getAllByText(/^\d+$/)
    .map((el) => el.textContent)
    .join(",");
}

describe("SlidingPagination", () => {
  it("centers the visible range around the current page", () => {
    render(
      <SlidingPagination
        minPage={1}
        maxPage={20}
        currentPage={10}
        onChange={vi.fn()}
      />,
    );

    expect(pageNumbers()).toBe("8,9,10,11,12");
  });

  it("clamps the range to minPage near the start", () => {
    render(
      <SlidingPagination
        minPage={1}
        maxPage={20}
        currentPage={1}
        onChange={vi.fn()}
      />,
    );

    expect(pageNumbers()).toBe("1,2,3,4,5");
  });

  it("clamps the range to maxPage near the end", () => {
    render(
      <SlidingPagination
        minPage={1}
        maxPage={20}
        currentPage={20}
        onChange={vi.fn()}
      />,
    );

    expect(pageNumbers()).toBe("16,17,18,19,20");
  });

  it("shrinks the range when there are fewer pages than the window size", () => {
    render(
      <SlidingPagination
        minPage={1}
        maxPage={3}
        currentPage={2}
        onChange={vi.fn()}
      />,
    );

    expect(pageNumbers()).toBe("1,2,3");
  });

  it("disables the previous button on the first page and calls onChange(page - 1) otherwise", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <SlidingPagination
        minPage={1}
        maxPage={20}
        currentPage={1}
        onChange={onChange}
      />,
    );

    expect(screen.getAllByRole("button")[0]).toBeDisabled();

    rerender(
      <SlidingPagination
        minPage={1}
        maxPage={20}
        currentPage={5}
        onChange={onChange}
      />,
    );
    const prevButton = screen.getAllByRole("button")[0];
    expect(prevButton).not.toBeDisabled();
    await user.click(prevButton);
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("disables the next button on the last page and calls onChange(page + 1) otherwise", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <SlidingPagination
        minPage={1}
        maxPage={20}
        currentPage={20}
        onChange={onChange}
      />,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons[buttons.length - 1]).toBeDisabled();

    rerender(
      <SlidingPagination
        minPage={1}
        maxPage={20}
        currentPage={5}
        onChange={onChange}
      />,
    );
    const nextButton = screen.getAllByRole("button").at(-1)!;
    expect(nextButton).not.toBeDisabled();
    await user.click(nextButton);
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it("calls onChange with the clicked page number", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SlidingPagination
        minPage={1}
        maxPage={20}
        currentPage={10}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByText("11"));

    expect(onChange).toHaveBeenCalledWith(11);
  });
});
