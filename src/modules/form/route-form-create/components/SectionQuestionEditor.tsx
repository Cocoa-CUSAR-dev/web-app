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
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Dispatch, SetStateAction, useCallback } from "react";

import { questionInputTypeNameMap } from "../../route-form-edit/formEditConstants";
import { QuestionInputType } from "../../route-form-edit/formEditTypes";
import { HandlerField, QuestionInput, SectionInput } from "../formCreateTypes";

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
    carryForward: false,
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

function isSectionsValid(sections: SectionInput[]): boolean {
  return (
    sections.length > 0 &&
    sections.every(
      (section) =>
        section.title.trim() &&
        section.questions.length > 0 &&
        section.questions.every((question) => question.label.trim()),
    )
  );
}

function SectionQuestionEditor({
  sections,
  setSections,
  handler,
  handlerFields,
  isMultipleSubmit = false,
}: {
  sections: SectionInput[];
  setSections: Dispatch<SetStateAction<SectionInput[]>>;
  handler: string;
  handlerFields: HandlerField[] | null;
  isMultipleSubmit?: boolean;
}) {
  const updateSection = useCallback(
    (index: number, patch: Partial<SectionInput>) => {
      setSections((prev) =>
        prev.map((section, i) =>
          i === index ? { ...section, ...patch } : section,
        ),
      );
    },
    [setSections],
  );

  const addSection = useCallback(() => {
    setSections((prev) => [...prev, emptySection()]);
  }, [setSections]);

  const removeSection = useCallback(
    (index: number) => {
      setSections((prev) => prev.filter((_, i) => i !== index));
    },
    [setSections],
  );

  const moveSection = useCallback(
    (index: number, direction: -1 | 1) => {
      setSections((prev) => moveItem(prev, index, direction));
    },
    [setSections],
  );

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
    [setSections],
  );

  const addQuestion = useCallback(
    (sectionIndex: number) => {
      setSections((prev) =>
        prev.map((section, i) =>
          i === sectionIndex
            ? {
                ...section,
                questions: [...section.questions, emptyQuestion()],
              }
            : section,
        ),
      );
    },
    [setSections],
  );

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
    [setSections],
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
    [setSections],
  );

  return (
    <>
      {sections.map((section, sectionIndex) => (
        <Accordion key={section.sectionId ?? sectionIndex} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            {section.title || `Section ${sectionIndex + 1}`}
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ md: "center" }}
              >
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
                <Stack direction={"row"} alignSelf={{ xs: "flex-end", md: "auto" }}>
                  <Tooltip title={"Move section up"}>
                    <span>
                      <IconButton
                        disabled={sectionIndex === 0}
                        onClick={() => moveSection(sectionIndex, -1)}
                      >
                        <ArrowUpwardRounded />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={"Move section down"}>
                    <span>
                      <IconButton
                        disabled={sectionIndex === sections.length - 1}
                        onClick={() => moveSection(sectionIndex, 1)}
                      >
                        <ArrowDownwardRounded />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={"Delete section"}>
                    <span>
                      <IconButton
                        disabled={sections.length === 1}
                        onClick={() => removeSection(sectionIndex)}
                      >
                        <DeleteRounded />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </Stack>

              {section.questions.map((question, questionIndex) => (
                <Box
                  key={question.questionId ?? questionIndex}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    padding: "1rem",
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack
                      direction={"row"}
                      justifyContent={"space-between"}
                      alignItems={"center"}
                    >
                      <Typography variant={"subtitle2"} color={"text.secondary"}>
                        {`Question ${questionIndex + 1}`}
                      </Typography>
                      <Stack direction={"row"}>
                        <Tooltip title={"Move question up"}>
                          <span>
                            <IconButton
                              size={"small"}
                              disabled={questionIndex === 0}
                              onClick={() =>
                                moveQuestion(sectionIndex, questionIndex, -1)
                              }
                            >
                              <ArrowUpwardRounded fontSize={"small"} />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={"Move question down"}>
                          <span>
                            <IconButton
                              size={"small"}
                              disabled={
                                questionIndex === section.questions.length - 1
                              }
                              onClick={() =>
                                moveQuestion(sectionIndex, questionIndex, 1)
                              }
                            >
                              <ArrowDownwardRounded fontSize={"small"} />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={"Delete question"}>
                          <span>
                            <IconButton
                              size={"small"}
                              disabled={section.questions.length === 1}
                              onClick={() =>
                                removeQuestion(sectionIndex, questionIndex)
                              }
                            >
                              <DeleteRounded fontSize={"small"} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </Stack>

                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
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
                    </Stack>

                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
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
                    </Stack>

                    <Stack direction={"row"} spacing={2} flexWrap={"wrap"}>
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
                      {isMultipleSubmit && (
                        <Tooltip
                          title={
                            "When the farmer adds another entry, reuse this answer from the previous one instead of asking again (e.g. the plot)."
                          }
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={question.carryForward ?? false}
                                onChange={(e) =>
                                  updateQuestion(sectionIndex, questionIndex, {
                                    carryForward: e.target.checked,
                                  })
                                }
                              />
                            }
                            label={"Reuse answer"}
                            sx={{ whiteSpace: "nowrap" }}
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  </Stack>
                </Box>
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
    </>
  );
}

function MultipleSubmitCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Tooltip
      title={
        "Farmers can submit this form more than once (e.g. one row per grade or per activity)."
      }
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
          />
        }
        label={"Allow multiple submissions"}
        sx={{ alignSelf: "start" }}
      />
    </Tooltip>
  );
}

export default SectionQuestionEditor;
export { emptyQuestion, emptySection, isSectionsValid, MultipleSubmitCheckbox };
