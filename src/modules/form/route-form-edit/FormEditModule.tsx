"use client";

import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SlidingPagination } from "@/components/table/SlidingPagination";
import { CustomToast } from "@/components/utility/CustomToast";
import { GlobalRowsPerPage } from "@/core/types";
import { fetchResponse } from "@/libs/fetchResponse";

import FormEditTable from "./components/FormEditTable";
import {
  FormEditRequest,
  FormEditRow,
  GetFormsResponse,
  Section,
} from "./formEditTypes";

function FormEditModule() {
  // #region page
  const [isPageLoading] = useState<boolean>(false);
  const toastIdRef = useRef<string | null>(null);
  const router = useRouter();

  // #region form
  const [formNameId, setFormNameId] = useState<{
    [key: string]: string;
  } | null>(null);

  const [formName, setFormName] = useState<string>("");

  const formId = useMemo(() => {
    if (formNameId && formNameId[formName]) {
      return formNameId[formName];
    }
    return null;
  }, [formName, formNameId]);

  // #region section
  const [sections, setSections] = useState<Section[] | null>(null);
  const [sectionIndex, setSectionIndex] = useState<number>(-1);

  const section = useMemo(() => {
    if (!sections || sectionIndex < 1) return null;
    return sections[sectionIndex - 1];
  }, [sectionIndex, sections]);

  const formSectionsRef = useRef<Section[] | null>(null);
  const editedSectionsRef = useRef<Record<number, FormEditRow[]>>({});

  const [dirtySections, setDirtySections] = useState<Record<number, boolean>>(
    {},
  );

  const [formEditRows, setFormEditRows] = useState<FormEditRow[] | null>([]);
  const [isFormLoading, setIsFormLoading] = useState<boolean>(false);

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<GlobalRowsPerPage | -1>(5);

  const isCurrentSectionEdited = !!dirtySections[sectionIndex];
  const isAnySectionEdited = Object.keys(dirtySections).length > 0;

  // #region form func
  const loadAllForms = useCallback(async () => {
    if (toastIdRef.current) {
      CustomToast.dismiss(toastIdRef.current);
    }
    try {
      const toastId = "form-audit-toast-id";
      const response = await CustomToast.promise(
        fetchResponse("/api/v1/forms", {
          method: "GET",
        }),
        {
          loading: "getting forms...",
          success: "successfully getting forms",
          error: "an error occured, please try again",
        },
        undefined,
        {
          duration: 5000,
          id: toastId,
        },
      );
      if (!response.ok) {
        throw new Error("error getting forms");
      }
      const data = await response.json();
      const { value }: GetFormsResponse = data;
      const nameIdMap: {
        [key: string]: string;
      } = {};
      value.forEach(({ title, formId }) => {
        nameIdMap[title] = formId;
      });
      setFormNameId(nameIdMap);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadForm = useCallback(async () => {
    if (toastIdRef.current) {
      CustomToast.dismiss(toastIdRef.current);
    }
    try {
      setIsFormLoading(true);
      const toastId = "load-form-id-toast-id";
      const response = await CustomToast.promise(
        fetchResponse(`/api/v1/forms/${formId}`, {
          method: "GET",
        }),
        {
          loading: `loading form: ${formName}`,
          success: `successfully loaded: ${formName}`,
          error: `failed to load: ${formName}`,
        },
        undefined,
        {
          duration: 5000,
          id: toastId,
        },
      );
      if (!response.ok) {
        throw new Error(`error loading form: ${formName}`);
      }
      const data = await response.json();
      const { value } = data;
      const { sections } = value;

      if (!sections || sections.length === 0) {
        throw new Error(`form sections are empty: ${formName}`);
      }

      setSections(sections);
      formSectionsRef.current = sections;

      editedSectionsRef.current = {};
      setDirtySections({});

      setSectionIndex(1);
    } catch (e) {
      console.error(e);
      setSections(null);
      formSectionsRef.current = null;
      editedSectionsRef.current = {};
      setDirtySections({});
      setSectionIndex(-1);
      setFormEditRows([]);
    } finally {
      setIsFormLoading(false);
    }
  }, [formId, formName]);

  // #region table func
  const handleChangePage = useCallback(
    (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      setPage(newPage);
    },
    [],
  );

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = parseInt(
        event.target.value,
        10,
      ) as unknown as GlobalRowsPerPage;
      setRowsPerPage(value);
      setPage(0);
    },
    [],
  );

  const handleEditTable = useCallback<(rows: FormEditRow[]) => void>(
    (rows: FormEditRow[]) => {
      setFormEditRows(rows);
      editedSectionsRef.current[sectionIndex] = rows;

      setDirtySections((prev) => ({
        ...prev,
        [sectionIndex]: true,
      }));
    },
    [sectionIndex],
  );

  const handleResetTable = useCallback(() => {
    if (!formSectionsRef.current || sectionIndex < 1) return;

    delete editedSectionsRef.current[sectionIndex];

    setDirtySections((prev) => {
      const nextState = { ...prev };
      delete nextState[sectionIndex];
      return nextState;
    });

    const sectionRef = formSectionsRef.current[sectionIndex - 1];
    const { questions } = sectionRef;
    const originalRows = questions.map((question) => {
      return {
        Form: question["label"],
        Field: question["inputType"],
        Description: question["description"],
        Status: question["isActive"],
        Required: question["isMandatory"],
      };
    });
    setFormEditRows(originalRows as FormEditRow[]);
  }, [sectionIndex]);

  const handleSubmitTable = useCallback(async () => {
    if (!sections) return;
    try {
      setIsFormLoading(true);

      const body: FormEditRequest["sections"] = sections.map(
        (section, index) => {
          const { questions, sectionId, isActive } = section;

          const currentSectionIndex = index + 1;
          const editedRows = editedSectionsRef.current[currentSectionIndex];

          const questionsObject = questions.map((question, questionIndex) => {
            const currentIsActive = editedRows
              ? editedRows[questionIndex].Status
              : question.isActive;
            const currentIsMandatory = editedRows
              ? editedRows[questionIndex].Required
              : question.isMandatory;
            return {
              questionId: question.questionId,
              isActive: currentIsActive,
              isMandatory: currentIsMandatory,
            };
          });

          return {
            sectionId,
            isActive,
            questions: questionsObject,
          };
        },
      );

      console.log(JSON.stringify(body));

      await fetchResponse(`/api/v1/forms/${formId}/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sections: body,
        }),
      });

      CustomToast.success("successfully submitted an edit", undefined, {
        duration: 5000,
      });

      await loadForm();

      editedSectionsRef.current = {};
      setDirtySections({});
    } catch (e) {
      console.error(e);
    } finally {
      setIsFormLoading(false);
    }
  }, [formId, loadForm, sections]);

  // #region effects
  useEffect(() => {
    loadAllForms();
  }, [loadAllForms]);

  useEffect(() => {
    if (!formId) return;
    loadForm();
  }, [formId, loadForm]);

  useEffect(() => {
    if (!sections || sectionIndex < 1) return;

    if (editedSectionsRef.current[sectionIndex]) {
      setFormEditRows(editedSectionsRef.current[sectionIndex]);
    } else {
      const sectionRef = sections[sectionIndex - 1];
      const { questions } = sectionRef;
      const originalRows: FormEditRow[] = questions.map((question) => {
        return {
          Form: question["label"],
          Field: question["inputType"],
          Description: question["description"],
          Status: question["isActive"],
          Required: question["isMandatory"],
          Choices: question["choices"],
        };
      });
      setFormEditRows(originalRows as FormEditRow[]);
    }
  }, [sectionIndex, sections]);

  // #region table
  const table = useMemo(() => {
    if (formEditRows && formEditRows.length != 0) {
      return (
        <FormEditTable
          rows={formEditRows}
          page={page}
          handleChangePage={handleChangePage}
          rowsPerPage={rowsPerPage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          allRowsCount={formEditRows.length}
          setRows={handleEditTable}
          loading={isFormLoading}
        />
      );
    }
    return null;
  }, [
    formEditRows,
    handleChangePage,
    handleChangeRowsPerPage,
    handleEditTable,
    isFormLoading,
    page,
    rowsPerPage,
  ]);

  // #region form select
  const formSelect = useMemo(() => {
    return (
      <FormControl
        sx={{
          flex: "1",
        }}
        size={"small"}
      >
        <InputLabel id={"form-select"}>{"Form"}</InputLabel>
        <Select
          labelId={"form-select"}
          id={"form-select-element"}
          value={formName}
          label={"Form"}
          onChange={(event: SelectChangeEvent) => {
            setFormName(event.target.value);
          }}
        >
          {formNameId &&
            Object.keys(formNameId).map((name) => {
              return (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              );
            })}
        </Select>
      </FormControl>
    );
  }, [formName, formNameId]);

  // #region section pagination
  const sectionPagingation = useMemo(() => {
    if (sectionIndex < 0 || !sections || !section) {
      return null;
    }
    return (
      <Stack
        width={"100%"}
        height={"2.5rem"}
        direction={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
        spacing={2}
      >
        <Typography>{"Section: " + section["title"]}</Typography>
        <SlidingPagination
          minPage={1}
          maxPage={sections.length}
          currentPage={sectionIndex}
          onChange={setSectionIndex}
        />
      </Stack>
    );
  }, [section, sectionIndex, sections]);

  // #region debug
  useEffect(() => {
    console.log(
      JSON.stringify({
        formEditRows,
      }),
    );
  }, [formEditRows]);

  if (isPageLoading) {
    return (
      <Stack
        width={"100%"}
        height={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <CircularProgress size={"small"} />
      </Stack>
    );
  }

  return (
    <Stack width={"100%"} height={"100%"} spacing={2}>
      <Typography variant={"h2"} noWrap={true} whiteSpace={"nowrap"}>
        {"Form Edit"}
      </Typography>
      {formNameId ? (
        <Stack direction={"row"} spacing={2} alignItems={"center"}>
          <Typography>{"กรุณาเลือกฟอร์ม"}</Typography>
          {formSelect}
          <Button
            variant={"outlined"}
            disabled={!formId}
            onClick={() => {
              router.push(`/form/form-create?duplicateFrom=${formId}`);
            }}
          >
            {"Duplicate"}
          </Button>
        </Stack>
      ) : (
        <Box width={"100%"} height={"2.5rem"}>
          <Skeleton
            variant={"rounded"}
            width={"100%"}
            height={"100%"}
            animation={"wave"}
          />
        </Box>
      )}
      {sectionPagingation}
      {table}
      {
        <Stack alignSelf={"end"} spacing={2} direction={"row"}>
          <Button
            variant={"outlined"}
            disabled={!isCurrentSectionEdited || isFormLoading}
            onClick={handleResetTable}
          >
            {"Reset"}
          </Button>
          <Button
            variant={"contained"}
            disabled={!isAnySectionEdited || isFormLoading}
            onClick={handleSubmitTable}
          >
            {"Save"}
          </Button>
        </Stack>
      }
    </Stack>
  );
}

export default FormEditModule;
