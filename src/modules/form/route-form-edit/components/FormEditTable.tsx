import { ErrorOutlineRounded, HelpRounded, Search } from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  IconButton,
  Modal,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TablePaginationActions,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useState } from "react";

import { globalRowsPerPage } from "@/core/constants";

import {
  formEditColumns,
  questionInputTypeNameMap,
} from "../formEditConstants";
import type {
  FormEditColumn,
  FormEditRow,
  QuestionInputType,
} from "../formEditTypes";

function FormEditTable({
  dense = true,
  excludedColumns = [],
  loading = false,
  rows,
  page,
  handleChangePage,
  rowsPerPage,
  handleChangeRowsPerPage,
  allRowsCount,
  setRows,
}: {
  dense?: boolean;
  excludedColumns?: FormEditColumn[];
  loading?: boolean;
  rows: FormEditRow[];
  page: number;
  handleChangePage: (
    even: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => void;
  rowsPerPage: number;
  handleChangeRowsPerPage: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  allRowsCount: number;
  setRows: (rows: FormEditRow[]) => void;
}) {
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;
  const numColumnLeft = formEditColumns.length - excludedColumns.length;

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalContent, setModalContent] = useState<string>("");
  const [modalAlignMode, setModalAlignMode] = useState<string>("center");

  // #region functions

  const handleChangeRow = useCallback(
    (rowIndex: number, newRow: FormEditRow) => {
      setRows([
        ...rows.slice(0, rowIndex),
        newRow,
        ...rows.slice(rowIndex + 1),
      ]);
    },
    [rows, setRows],
  );

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => {
    setModalOpen(false);
    setModalAlignMode("center");
  };

  // #region component
  return (
    <>
      <Box
        width={"100%"}
        position={"relative"}
        sx={{
          borderRadius: "0.5rem",
          overflow: "hidden",
        }}
      >
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
              tableLayout: "fixed",
            }}
          >
            <TableHead>
              <TableRow>
                {formEditColumns.map((column, idx) => {
                  if (excludedColumns.includes(column)) return null;
                  const cellSize =
                    column === "Description"
                      ? "25%"
                      : column === "Field"
                        ? "10%"
                        : `calc(65% / ${numColumnLeft})`;
                  return (
                    <TableCell
                      key={column + idx}
                      align={"left"}
                      sx={{
                        fontWeight: "600",
                        width: cellSize,
                      }}
                    >
                      <Typography noWrap>{column}</Typography>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? rows.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage,
                  )
                : rows
              ).map((row, rowIdx) => {
                const choices = row["Choices"];
                return (
                  <TableRow key={"row" + rowIdx}>
                    {formEditColumns.map((column, colIdx) => {
                      if (excludedColumns.includes(column)) return null;

                      const value = row[column];
                      const cellKey = `row-${rowIdx}-col-${colIdx}`;

                      if (column === "Required" && typeof value === "boolean") {
                        return (
                          <TableCell key={cellKey}>
                            <ToggleButtonGroup
                              value={value}
                              exclusive
                              sx={{
                                maxWidth: "100%",
                              }}
                              onChange={(_, newValue: boolean | null) => {
                                if (newValue !== null) {
                                  const newRow: FormEditRow = {
                                    ...row,
                                    Required: newValue,
                                  };
                                  handleChangeRow(rowIdx, newRow);
                                }
                              }}
                            >
                              <ToggleButton value={false}>
                                <Typography noWrap>{"Optional"}</Typography>
                              </ToggleButton>
                              <ToggleButton value={true}>
                                <Typography noWrap>{"Required"}</Typography>
                              </ToggleButton>
                            </ToggleButtonGroup>
                          </TableCell>
                        );
                      }

                      if (column === "Status" && typeof value === "boolean") {
                        return (
                          <TableCell key={cellKey}>
                            <ToggleButtonGroup
                              value={value}
                              exclusive
                              sx={{
                                maxWidth: "100%",
                              }}
                              onChange={(_, newValue: boolean | null) => {
                                if (newValue !== null) {
                                  const newRow: FormEditRow = {
                                    ...row,
                                    Status: newValue,
                                  };
                                  handleChangeRow(rowIdx, newRow);
                                }
                              }}
                            >
                              <ToggleButton value={false}>
                                <Typography noWrap>{"Inactive"}</Typography>
                              </ToggleButton>
                              <ToggleButton value={true}>
                                <Typography noWrap>{"Active"}</Typography>
                              </ToggleButton>
                            </ToggleButtonGroup>
                          </TableCell>
                        );
                      }

                      if (column === "Description") {
                        if (!value) {
                          return <TableCell key={cellKey}>{"-"}</TableCell>;
                        }
                        return (
                          <TableCell key={cellKey}>
                            <Stack
                              direction={"row"}
                              justifyContent={"space-between"}
                              alignItems={"center"}
                              spacing={0.5}
                            >
                              <Typography noWrap>{value}</Typography>
                              <Tooltip
                                placement={"right"}
                                title={"ดูข้อความเต็ม"}
                              >
                                <IconButton
                                  sx={{
                                    padding: "0.25rem",
                                  }}
                                  onClick={() => {
                                    handleModalOpen();
                                    setModalTitle(row["Form"]);
                                    setModalContent(value as string);
                                  }}
                                >
                                  <HelpRounded />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        );
                      }
                      if (column === "Field") {
                        if (value === "OPTION") {
                          const buttonIcon = choices ? (
                            <Search
                              sx={{
                                width: "1rem",
                                height: "1rem",
                              }}
                            />
                          ) : (
                            <ErrorOutlineRounded
                              sx={{
                                width: "1rem",
                                height: "1rem",
                              }}
                              color={"error"}
                            />
                          );
                          const buttonFunction = choices
                            ? () => {
                                setModalOpen(true);
                                setModalTitle(`Choice of ${row["Form"]}`);
                                setModalContent(
                                  choices
                                    .map(
                                      (choice, idx) => `${idx + 1}. ${choice}`,
                                    )
                                    .join("\n"),
                                );
                                setModalAlignMode("start");
                              }
                            : undefined;
                          const tooltipTitle = choices
                            ? undefined
                            : "This question doesn't contain any choices.";
                          return (
                            <TableCell key={cellKey}>
                              <Stack
                                direction={"row"}
                                spacing={1}
                                alignItems={"center"}
                              >
                                <Typography noWrap>
                                  {questionInputTypeNameMap[value]}
                                </Typography>
                                <Tooltip
                                  title={tooltipTitle}
                                  placement={"right"}
                                >
                                  <IconButton
                                    sx={{
                                      padding: "0.125rem",
                                    }}
                                    onClick={buttonFunction}
                                  >
                                    {buttonIcon}
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          );
                        }
                        return (
                          <TableCell key={cellKey}>
                            <Typography noWrap>
                              {
                                questionInputTypeNameMap[
                                  value as QuestionInputType
                                ]
                              }
                            </Typography>
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell key={cellKey}>
                          <Typography noWrap>{value}</Typography>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  sx={{
                    height: (dense ? 47.2 : 67) * emptyRows,
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
      <Modal open={modalOpen} onClose={handleModalClose}>
        <Stack
          padding={"2rem"}
          spacing={1}
          borderRadius={"0.5rem"}
          bgcolor={"white"}
          width={"20rem"}
          maxWidth={"calc(100% - 2rem)"}
          alignItems={"center"}
          position={"relative"}
          top={"50%"}
          left={"50%"}
          sx={{
            transform: "translate(-50%, -50%)",
          }}
        >
          <Typography variant={"h3"} textAlign={"center"}>
            {modalTitle}
          </Typography>
          <Typography
            textAlign={modalAlignMode === "center" ? "center" : "start"}
            whiteSpace={"pre"}
            width={"95%"}
          >
            {modalContent}
          </Typography>
        </Stack>
      </Modal>
    </>
  );
}

export default FormEditTable;
