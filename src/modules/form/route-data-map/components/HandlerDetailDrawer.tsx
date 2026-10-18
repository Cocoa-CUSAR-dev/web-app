"use client";

import { CloseRounded } from "@mui/icons-material";
import {
  Box,
  Drawer,
  IconButton,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import NextLink from "next/link";

import {
  CatalogEntry,
  HandlerCatalog,
} from "../../formDefinition/handlerCatalogTypes";
import { GetFormsResponse } from "../../route-form-edit/formEditTypes";
import { fieldRows, frequencyLabels, referenceLabel } from "../dataMapLayout";

// View 2 (doc §3.4): one handler's columns -- type, required, what it
// points at, what it depends on, how many forms ask it -- and its forms.
function HandlerDetailDrawer({
  catalog,
  entry,
  forms,
  side,
  onClose,
}: {
  catalog: HandlerCatalog;
  entry: CatalogEntry | null;
  forms: GetFormsResponse["value"];
  // The side away from the clicked card, so the card and its highlighted
  // links stay in view next to the panel.
  side: "left" | "right";
  onClose: () => void;
}) {
  return (
    // Persistent, not modal: no dimmed backdrop over the map, and clicking
    // another card just switches the panel to it.
    <Drawer
      anchor={side}
      variant={"persistent"}
      open={entry !== null}
      onClose={onClose}
      slotProps={{ paper: { elevation: 8, sx: { borderWidth: 0 } } }}
    >
      {entry && (
        <Stack
          spacing={2}
          padding={"1.5rem"}
          width={{ xs: "100vw", sm: "32rem" }}
          maxWidth={"100vw"}
          boxSizing={"border-box"}
        >
          <Stack direction={"row"} justifyContent={"space-between"}>
            <Stack spacing={0.5} minWidth={0}>
              <Typography variant={"h5"} fontWeight={600}>
                {entry.labelTh}
              </Typography>
              <Typography
                variant={"body2"}
                color={"text.secondary"}
                sx={{ wordBreak: "break-all" }}
              >
                {`${entry.handler} → ${entry.table} · ${frequencyLabels[entry.frequency]}`}
              </Typography>
              {entry.parentHandler && (
                <Typography variant={"body2"} color={"text.secondary"}>
                  {`อยู่ใต้ ${referenceLabel(
                    catalog,
                    catalog.handlers.find(
                      (h) => h.handler === entry.parentHandler,
                    )?.table ?? null,
                  )} (ผู้กรอกเลือก ${entry.parentField} ก่อนเริ่มฟอร์ม)`}
                </Typography>
              )}
            </Stack>
            <IconButton onClick={onClose} aria-label={"ปิด"}>
              <CloseRounded />
            </IconButton>
          </Stack>
          {entry.descriptionTh && (
            <Typography variant={"body2"}>{entry.descriptionTh}</Typography>
          )}

          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size={"small"}>
              <TableHead>
                <TableRow>
                  <TableCell>{"ฟิลด์ (คอลัมน์)"}</TableCell>
                  <TableCell>{"ชนิด"}</TableCell>
                  <TableCell align={"center"}>{"บังคับ"}</TableCell>
                  <TableCell>{"อ้างอิง"}</TableCell>
                  <TableCell>{"ขึ้นกับ"}</TableCell>
                  <TableCell align={"right"}>{"ใช้ในฟอร์ม"}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fieldRows(catalog, entry).map((row) => (
                  <TableRow key={row.name}>
                    <TableCell>
                      <Typography variant={"body2"} fontFamily={"monospace"}>
                        {row.name}
                      </Typography>
                      {row.label && (
                        <Typography
                          variant={"caption"}
                          color={"text.secondary"}
                        >
                          {row.label}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{row.typeLabel}</TableCell>
                    <TableCell align={"center"}>
                      {row.required ? "✔" : ""}
                    </TableCell>
                    <TableCell sx={{ wordBreak: "break-all" }}>
                      {row.reference ?? "—"}
                    </TableCell>
                    <TableCell>{row.dependsOn ?? "—"}</TableCell>
                    <TableCell align={"right"}>{row.usage}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack spacing={0.5}>
            <Typography variant={"subtitle2"}>
              {`ฟอร์มที่ใช้ (${forms.length})`}
            </Typography>
            {forms.length === 0 ? (
              <Typography variant={"body2"} color={"text.secondary"}>
                {"ยังไม่มีฟอร์มที่บันทึกลงตารางนี้"}
              </Typography>
            ) : (
              <Box component={"ul"} margin={0} paddingLeft={"1.25rem"}>
                {forms.map((form) => (
                  <li key={form.formId}>
                    <Link
                      component={NextLink}
                      href={`/form/form-viewer/${form.taskId}`}
                    >
                      {form.title}
                    </Link>
                  </li>
                ))}
              </Box>
            )}
          </Stack>
        </Stack>
      )}
    </Drawer>
  );
}

export default HandlerDetailDrawer;
