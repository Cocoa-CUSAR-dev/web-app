import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import GenericTable from "@/components/table/GenericTable";

type Column = "Name" | "Age";

const rows: Record<Column, string | number>[] = [
  { Name: "Alice", Age: 30 },
  { Name: "Bob", Age: 25 },
  { Name: "Carol", Age: 40 },
];

const defaultProps = {
  rows,
  page: 0,
  handleChangePage: vi.fn(),
  rowsPerPage: 2,
  handleChangeRowsPerPage: vi.fn(),
  allRowsCount: rows.length,
  columns: ["Name", "Age"] as Column[],
};

describe("GenericTable", () => {
  it("renders a header cell for every column", () => {
    render(<GenericTable {...defaultProps} />);

    expect(
      screen.getByRole("columnheader", { name: "Name" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Age" }),
    ).toBeInTheDocument();
  });

  it("omits excluded columns from both header and rows", () => {
    render(<GenericTable {...defaultProps} excludedColumns={["Age"]} />);

    expect(screen.queryByRole("columnheader", { name: "Age" })).toBeNull();
    expect(screen.queryByText("30")).toBeNull();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("only renders the rows for the current page when rowsPerPage > 0", () => {
    render(<GenericTable {...defaultProps} page={0} rowsPerPage={2} />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.queryByText("Carol")).toBeNull();
  });

  it("renders the second page slice", () => {
    render(<GenericTable {...defaultProps} page={1} rowsPerPage={2} />);

    expect(screen.queryByText("Alice")).toBeNull();
    expect(screen.getByText("Carol")).toBeInTheDocument();
  });

  it("renders every row unsliced when rowsPerPage is -1 (show all)", () => {
    render(<GenericTable {...defaultProps} rowsPerPage={-1} />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Carol")).toBeInTheDocument();
  });

  it("shows a loading overlay when loading is true", () => {
    render(<GenericTable {...defaultProps} loading />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows no loading overlay by default", () => {
    render(<GenericTable {...defaultProps} />);

    expect(screen.queryByRole("progressbar")).toBeNull();
  });
});
