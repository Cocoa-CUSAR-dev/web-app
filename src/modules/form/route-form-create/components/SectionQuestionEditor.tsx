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
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
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
}: {
  sections: SectionInput[];
  setSections: Dispatch<SetStateAction<SectionInput[]>>;
  handler: string;
  handlerFields: HandlerField[] | null;
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
                <Stack key={question.questionId ?? questionIndex}>
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
    </>
  );
}

export default SectionQuestionEditor;
export { emptyQuestion, emptySection, isSectionsValid };
