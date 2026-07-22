import {
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TablePaginationActions,
  TableRow,
} from "@mui/material";

import { farmColumns, globalRowsPerPage } from "@/core/constants";
import type { FarmColumn } from "@/core/types";

function FarmTable({
  dense = true,
  excludedColumns = [],
  loading = false,
  rows,
  page,
  handleChangePage,
  rowsPerPage,
  handleChangeRowsPerPage,
  allRowsCount,
}: {
  dense?: boolean;
  excludedColumns?: FarmColumn[];
  loading?: boolean;
  rows: Record<FarmColumn, string | number>[];
  page: number;
  handleChangePage: (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => void;
  rowsPerPage: number;
  handleChangeRowsPerPage: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  allRowsCount: number;
}) {
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const numColumnLeft = farmColumns.length - excludedColumns.length;

  return (
    <Box width={"100%"} position={"relative"}>
      <TableContainer
        sx={{
          borderRadius: "0.5rem",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "#606060",
          scrollbarWidth: "thin",
        }}
      >
        <Table
          size={dense ? "small" : "medium"}
          sx={{
            minWidth: `${numColumnLeft * 120}px`,
          }}
        >
          <TableHead>
            <TableRow>
              {farmColumns.map((column, idx) => {
                if (excludedColumns.includes(column)) return null;
                return (
                  <TableCell
                    key={column + idx}
                    align={"left"}
                    sx={{
                      fontWeight: "600",
                      width: `calc(100% / ${numColumnLeft})`,
                    }}
                  >
                    {column}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : rows
            ).map((row, idx) => {
              return (
                <TableRow key={"row" + idx}>
                  {Object.entries(row).map((rowEntry, innerIdx) => {
                    const [key, value] = rowEntry as [
                      FarmColumn,
                      string | number,
                    ];
                    if (excludedColumns.includes(key)) return null;
                    return (
                      <TableCell key={"row" + idx + "cell" + innerIdx}>
                        {value};
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
            {emptyRows > 0 && (
              <TableRow
                sx={{
                  height: (dense ? 33.01 : 53) * emptyRows,
                }}
              ></TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                size={dense ? "small" : "medium"}
                rowsPerPageOptions={[
                  ...globalRowsPerPage,
                  { label: "All", value: -1 },
                ]}
                colSpan={numColumnLeft}
                count={allRowsCount}
                rowsPerPage={rowsPerPage}
                page={page}
                slotProps={{
                  select: {
                    inputProps: {
                      "aria-label": "rows per page",
                    },
                  },
                  displayedRows: {
                    sx: {
                      userSelect: "none",
                    },
                  },
                }}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
                sx={{
                  borderBottom: "none",
                }}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      {loading && (
        <Box
          width={"100%"}
          height={"100%"}
          position={"absolute"}
          top={"0"}
          left={"0"}
          bgcolor={"white"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          sx={{
            borderRadius: "0.5rem",
            opacity: "0.33",
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}

export default FarmTable;
