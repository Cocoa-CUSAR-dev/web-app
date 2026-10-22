"use client";

import {
  Alert,
  Box,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import { fetchResponse } from "@/libs/fetchResponse";

import { buildFieldMap, FieldMap } from "../../../formDefinition/fieldMap";
import { HandlerCatalogResponse } from "../../../formDefinition/handlerCatalogTypes";
import {
  GetFormIdResponse,
  GetFormsResponse,
} from "../../../route-form-edit/formEditTypes";

const noteIcons = { error: "⛔", warning: "⚠️", info: "🔗" } as const;

// "ข้อมูลไปลงที่ไหน": where each question's answer is inserted, and the
// questions whose answers never reach a table.
function FormFieldMapTab({ taskId }: { taskId: string }) {
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "failed" }
    | { status: "ready"; table: string | null; map: FieldMap }
  >({ status: "loading" });

  useEffect(() => {
    (async () => {
      try {
        const [listResponse, catalogResponse] = await Promise.all([
          fetchResponse("/api/v1/forms", { method: "GET" }),
          fetchResponse("/api/v1/forms/handlers/catalog", { method: "GET" }),
        ]);
        const { value: forms }: GetFormsResponse = await listResponse.json();
        const { value: catalog }: HandlerCatalogResponse =
          await catalogResponse.json();
        const listEntry = forms.find((form) => form.taskId === taskId);
        if (!listEntry) throw new Error(`no form for task ${taskId}`);
        const formResponse = await fetchResponse(
          `/api/v1/forms/${listEntry.formId}`,
          { method: "GET" },
        );
        const { value: form }: GetFormIdResponse = await formResponse.json();
        const entry = catalog.handlers.find(
          (h) => h.handler === listEntry.handler,
        );
        setState({
          status: "ready",
          table: entry?.table ?? null,
          map: buildFieldMap({
            sections: form.sections,
            entry,
            dependencies: catalog.dependencies,
            fieldLabels: catalog.fieldLabels,
          }),
        });
      } catch (e) {
        console.error(e);
        setState({ status: "failed" });
      }
    })();
  }, [taskId]);

  if (state.status === "loading") {
    return (
      <Box padding={"2rem"} textAlign={"center"}>
        <CircularProgress />
      </Box>
    );
  }
  if (state.status === "failed") {
    return (
      <Typography color={"error"}>
        {"โหลดข้อมูลฟอร์มไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"}
      </Typography>
    );
  }

  const { table, map } = state;
  return (
    <Stack spacing={2} paddingBottom={"3rem"}>
      <Typography color={"text.secondary"}>
        {table
          ? `คำตอบของฟอร์มนี้ถูกบันทึกลงตาราง ${table}`
          : "ไม่พบตารางปลายทางของฟอร์มนี้ในแผนผังข้อมูล"}
      </Typography>
      {map.missingRequired.map((field) => (
        <Alert key={field} severity={"error"} icon={false}>
          {`⛔ ตารางนี้บังคับฟิลด์ ${field} แต่ฟอร์มไม่มีคำถามนี้: ส่งไม่ผ่านแน่นอน`}
        </Alert>
      ))}
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table size={"small"}>
          <TableHead>
            <TableRow>
              <TableCell>{"คำถาม"}</TableCell>
              <TableCell>{"ไปลงที่"}</TableCell>
              <TableCell>{"หมายเหตุ"}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {map.rows.map((row) => (
              <TableRow key={row.questionId}>
                <TableCell>
                  <Typography variant={"body2"}>{row.label}</Typography>
                  {row.fieldName && (
                    <Typography
                      variant={"caption"}
                      color={"text.secondary"}
                      fontFamily={"monospace"}
                    >
                      {row.fieldName}
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ wordBreak: "break-all" }}>
                  {row.target ? `→ ${row.target}` : "—"}
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    {row.notes.map((note) => (
                      <Typography
                        key={note.text}
                        variant={"body2"}
                        color={
                          note.severity === "error"
                            ? "error"
                            : note.severity === "warning"
                              ? "warning.dark"
                              : "text.secondary"
                        }
                      >
                        {`${noteIcons[note.severity]} ${note.text}`}
                      </Typography>
                    ))}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

export default FormFieldMapTab;
