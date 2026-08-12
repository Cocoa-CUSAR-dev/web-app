"use client";

import {
  AddRounded,
  ArrowDownwardRounded,
  ArrowUpwardRounded,
  DeleteRounded,
  ExpandMore,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { CustomToast } from "@/components/utility/CustomToast";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import { fetchResponse } from "@/libs/fetchResponse";

import { questionInputTypeNameMap } from "../route-form-edit/formEditConstants";
import {
  GetFormIdResponse,
  GetFormsResponse,
  QuestionInputType,
} from "../route-form-edit/formEditTypes";
import {
  CreateFormRequest,
  HandlerField,
  HandlerFieldsResponse,
  HandlersResponse,
  QuestionInput,
  SectionInput,
} from "./formCreateTypes";

const questionInputTypes = Object.keys(
  questionInputTypeNameMap,
) as QuestionInputType[];

function emptyQuestion(): QuestionInput {
  return {
    label: "",
    description: "",
    inputType: "VARCHAR",
    fieldName: "",
    isMandatory: false,
    sortOrder: 0,
  };
}

function emptySection(): SectionInput {
  return {
    title: "",
    description: "",
    sortOrder: 0,
    questions: [emptyQuestion()],
  };
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function FormCreateModule() {
  const { roles, isAuthenticated } = useAuthInfo();
  const isPageLoading = Boolean(!roles);
  const router = useRouter();
  const searchParams = useSearchParams();
  const duplicateFromFormId = searchParams.get("duplicateFrom");
  const toastIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && !roles) {
      router.push("/");
    }
  }, [isAuthenticated, roles, router]);

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [openAt, setOpenAt] = useState<string>("");
  const [closeAt, setCloseAt] = useState<string>("");
  const [handler, setHandler] = useState<string>("");
  const [sections, setSections] = useState<SectionInput[]>([emptySection()]);

  const [handlers, setHandlers] = useState<string[] | null>(null);
  const [handlerFields, setHandlerFields] = useState<HandlerField[] | null>(
    null,
  );
  const [boxLoading, setBoxLoading] = useState<boolean>(false);
  const [duplicating, setDuplicating] = useState<boolean>(
    Boolean(duplicateFromFormId),
  );

  // #region duplicate from an existing form
  // openAt/closeAt aren't part of Form.Detail (they live on form.task, which
  // no form-read endpoint exposes today) -- duplicating a form's structure
  // with a fresh, researcher-chosen open/close window is the sane default
  // anyway, so those two fields are deliberately left blank here.
  useEffect(() => {
    if (!duplicateFromFormId) return;
    (async () => {
      try {
        const [formResponse, listResponse] = await Promise.all([
          fetchResponse(`/api/v1/forms/${duplicateFromFormId}`, {
            method: "GET",
          }),
          fetchResponse("/api/v1/forms", { method: "GET" }),
        ]);
        const { value: form }: GetFormIdResponse = await formResponse.json();
        const { value: allForms }: GetFormsResponse = await listResponse.json();
        const sourceListEntry = allForms.find(
          (f) => f.formId === duplicateFromFormId,
        );

        setTitle(`Copy of ${form.title}`);
        setDescription(form.description ?? "");
        setHandler(sourceListEntry?.handler ?? "");
        setSections(
          form.sections.map((section) => ({
            title: section.title,
            description: section.description,
            sortOrder: section.sortOrder,
            questions: section.questions.map((question) => ({
              label: question.label,
              description: question.description,
              inputType: question.inputType,
              fieldName: question.fieldName,
              isMandatory: question.isMandatory,
              sortOrder: question.sortOrder,
            })),
          })),
        );
      } catch (e) {
        console.error(e);
        CustomToast.error("failed to load the form to duplicate", undefined, {
          duration: 5000,
        });
      } finally {
        setDuplicating(false);
      }
    })();
  }, [duplicateFromFormId]);

  // #region load catalogs
  useEffect(() => {
    (async () => {
      try {
        const response = await fetchResponse("/api/v1/forms/handlers", {
          method: "GET",
        });
        const { value }: HandlersResponse = await response.json();
        setHandlers(value);
      } catch (e) {
        console.error(e);
        setHandlers([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!handler) {
      setHandlerFields(null);
      return;
    }
    (async () => {
      try {
        const response = await fetchResponse(
          `/api/v1/forms/handlers/${handler}/fields`,
          {
            method: "GET",
          },
        );
        const { value }: HandlerFieldsResponse = await response.json();
        setHandlerFields(value);
      } catch (e) {
        console.error(e);
        setHandlerFields([]);
      }
    })();
  }, [handler]);

  // #region section/question editing
  const updateSection = useCallback(
    (index: number, patch: Partial<SectionInput>) => {
      setSections((prev) =>
        prev.map((section, i) =>
          i === index ? { ...section, ...patch } : section,
        ),
      );
    },
    [],
  );

  const addSection = useCallback(() => {
    setSections((prev) => [...prev, emptySection()]);
  }, []);

  const removeSection = useCallback((index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const moveSection = useCallback((index: number, direction: -1 | 1) => {
    setSections((prev) => moveItem(prev, index, direction));
  }, []);

  const updateQuestion = useCallback(
    (
      sectionIndex: number,
      questionIndex: number,
      patch: Partial<QuestionInput>,
    ) => {
      setSections((prev) =>
        prev.map((section, i) => {
          if (i !== sectionIndex) return section;
          return {
            ...section,
            questions: section.questions.map((question, qi) =>
              qi === questionIndex ? { ...question, ...patch } : question,
            ),
          };
        }),
      );
    },
    [],
  );

  const addQuestion = useCallback((sectionIndex: number) => {
    setSections((prev) =>
      prev.map((section, i) =>
        i === sectionIndex
          ? { ...section, questions: [...section.questions, emptyQuestion()] }
          : section,
      ),
    );
  }, []);

  const removeQuestion = useCallback(
    (sectionIndex: number, questionIndex: number) => {
      setSections((prev) =>
        prev.map((section, i) =>
          i === sectionIndex
            ? {
                ...section,
                questions: section.questions.filter(
                  (_, qi) => qi !== questionIndex,
                ),
              }
            : section,
        ),
      );
    },
    [],
  );

  const moveQuestion = useCallback(
    (sectionIndex: number, questionIndex: number, direction: -1 | 1) => {
      setSections((prev) =>
        prev.map((section, i) =>
          i === sectionIndex
            ? {
                ...section,
                questions: moveItem(
                  section.questions,
                  questionIndex,
                  direction,
                ),
              }
            : section,
        ),
      );
    },
    [],
  );

  // #region validation
  const isFormValid =
    title.trim() &&
    handler.trim() &&
    openAt &&
    closeAt &&
    sections.length > 0 &&
    sections.every(
      (section) =>
        section.title.trim() &&
        section.questions.length > 0 &&
        section.questions.every((question) => question.label.trim()),
    );

  // #region submit
  const handleSubmit = useCallback(async () => {
    if (!isFormValid) return;
    if (toastIdRef.current) {
      CustomToast.dismiss(toastIdRef.current);
    }
    try {
      setBoxLoading(true);
      const toastId = "form-create-toast-id";
      toastIdRef.current = toastId;

      const body: CreateFormRequest = {
        title,
        description: description.trim() || null,
        openAt,
        closeAt,
        handler,
        sections: sections.map((section, sectionIndex) => ({
          title: section.title,
          description: section.description?.trim() || null,
          sortOrder: sectionIndex,
          questions: section.questions.map((question, questionIndex) => ({
            label: question.label,
            description: question.description?.trim() || null,
            inputType: question.inputType,
            fieldName: question.fieldName || null,
            isMandatory: question.isMandatory,
            sortOrder: questionIndex,
          })),
        })),
      };

      const response = await CustomToast.promise(
        fetchResponse("/api/v1/forms", {
          method: "POST",
          body: JSON.stringify(body),
        }),
        {
          loading: "creating form...",
          success: "form created successfully",
          error: "failed to create form, please try again",
        },
        undefined,
        {
          duration: 3000,
          id: toastId,
        },
      );
      await response.json();
      router.push("/form/form-edit");
    } catch (e) {
      console.error(e);
    } finally {
      setBoxLoading(false);
    }
  }, [
    closeAt,
    description,
    handler,
    isFormValid,
    openAt,
    router,
    sections,
    title,
  ]);

  if (isPageLoading || duplicating) {
    return (
      <Stack
        width={"100%"}
        height={"100%"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack width={"100%"} spacing={2}>
      <Typography variant={"h2"}>{"Create Form"}</Typography>
      {duplicateFromFormId && (
        <Typography variant={"body2"} color={"text.secondary"}>
          {"Duplicated from an existing form — review before creating."}
        </Typography>
      )}

      <Stack component={Paper} elevation={2} padding={"1.5rem"} spacing={2}>
        <TextField
          fullWidth
          size={"small"}
          label={"Title"}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          fullWidth
          size={"small"}
          label={"Description"}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Stack direction={"row"} spacing={2}>
          <TextField
            fullWidth
            size={"small"}
            type={"datetime-local"}
            label={"Open At"}
            slotProps={{ inputLabel: { shrink: true } }}
            value={openAt}
            onChange={(e) => setOpenAt(e.target.value)}
          />
          <TextField
            fullWidth
            size={"small"}
            type={"datetime-local"}
            label={"Close At"}
            slotProps={{ inputLabel: { shrink: true } }}
            value={closeAt}
            onChange={(e) => setCloseAt(e.target.value)}
          />
        </Stack>
        <Select
          fullWidth
          size={"small"}
          displayEmpty
          value={handler}
          onChange={(e) => setHandler(e.target.value)}
        >
          <MenuItem value={""} disabled>
            {handlers === null ? "loading handlers..." : "Select a handler"}
          </MenuItem>
          {handlers?.map((h) => (
            <MenuItem key={h} value={h}>
              {h}
            </MenuItem>
          ))}
        </Select>
      </Stack>

      {sections.map((section, sectionIndex) => (
        <Accordion key={sectionIndex} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            {section.title || `Section ${sectionIndex + 1}`}
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Stack direction={"row"} spacing={2} alignItems={"center"}>
                <TextField
                  fullWidth
                  size={"small"}
                  label={"Section Title"}
                  value={section.title}
                  onChange={(e) =>
                    updateSection(sectionIndex, { title: e.target.value })
                  }
                />
                <TextField
                  fullWidth
                  size={"small"}
                  label={"Section Description"}
                  value={section.description ?? ""}
                  onChange={(e) =>
                    updateSection(sectionIndex, {
                      description: e.target.value,
                    })
                  }
                />
                <IconButton
                  disabled={sectionIndex === 0}
                  onClick={() => moveSection(sectionIndex, -1)}
                >
                  <ArrowUpwardRounded />
                </IconButton>
                <IconButton
                  disabled={sectionIndex === sections.length - 1}
                  onClick={() => moveSection(sectionIndex, 1)}
                >
                  <ArrowDownwardRounded />
                </IconButton>
                <IconButton
                  disabled={sections.length === 1}
                  onClick={() => removeSection(sectionIndex)}
                >
                  <DeleteRounded />
                </IconButton>
              </Stack>

              {section.questions.map((question, questionIndex) => (
                <Stack key={questionIndex}>
                  <Divider sx={{ marginBottom: "1rem" }} />
                  <Stack direction={"row"} spacing={2} alignItems={"center"}>
                    <TextField
                      fullWidth
                      size={"small"}
                      label={"Label"}
                      value={question.label}
                      onChange={(e) =>
                        updateQuestion(sectionIndex, questionIndex, {
                          label: e.target.value,
                        })
                      }
                    />
                    <TextField
                      fullWidth
                      size={"small"}
                      label={"Description"}
                      value={question.description ?? ""}
                      onChange={(e) =>
                        updateQuestion(sectionIndex, questionIndex, {
                          description: e.target.value,
                        })
                      }
                    />
                    <Select
                      fullWidth
                      size={"small"}
                      value={question.inputType}
                      onChange={(e) =>
                        updateQuestion(sectionIndex, questionIndex, {
                          inputType: e.target.value as QuestionInputType,
                        })
                      }
                    >
                      {questionInputTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {questionInputTypeNameMap[type]}
                        </MenuItem>
                      ))}
                    </Select>
                    <Select
                      fullWidth
                      size={"small"}
                      displayEmpty
                      value={question.fieldName ?? ""}
                      onChange={(e) =>
                        updateQuestion(sectionIndex, questionIndex, {
                          fieldName: e.target.value,
                        })
                      }
                    >
                      <MenuItem value={""} disabled>
                        {!handler
                          ? "select a handler first"
                          : handlerFields === null
                            ? "loading fields..."
                            : "Select a field"}
                      </MenuItem>
                      {handlerFields?.map((field) => (
                        <MenuItem key={field.name} value={field.name}>
                          {field.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={question.isMandatory}
                          onChange={(e) =>
                            updateQuestion(sectionIndex, questionIndex, {
                              isMandatory: e.target.checked,
                            })
                          }
                        />
                      }
                      label={"Required"}
                      sx={{ whiteSpace: "nowrap" }}
                    />
                    <IconButton
                      disabled={questionIndex === 0}
                      onClick={() =>
                        moveQuestion(sectionIndex, questionIndex, -1)
                      }
                    >
                      <ArrowUpwardRounded />
                    </IconButton>
                    <IconButton
                      disabled={questionIndex === section.questions.length - 1}
                      onClick={() =>
                        moveQuestion(sectionIndex, questionIndex, 1)
                      }
                    >
                      <ArrowDownwardRounded />
                    </IconButton>
                    <IconButton
                      disabled={section.questions.length === 1}
                      onClick={() =>
                        removeQuestion(sectionIndex, questionIndex)
                      }
                    >
                      <DeleteRounded />
                    </IconButton>
                  </Stack>
                </Stack>
              ))}

              <Box>
                <Button
                  startIcon={<AddRounded />}
                  onClick={() => addQuestion(sectionIndex)}
                >
                  {"Add Question"}
                </Button>
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}

      <Box>
        <Button startIcon={<AddRounded />} onClick={addSection}>
          {"Add Section"}
        </Button>
      </Box>

      <Stack alignSelf={"end"} direction={"row"} spacing={2}>
        <Button
          variant={"contained"}
          disabled={!isFormValid || boxLoading}
          onClick={handleSubmit}
        >
          {"Create Form"}
        </Button>
      </Stack>
    </Stack>
  );
}

export default FormCreateModule;
