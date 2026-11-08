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
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  FormHelperText,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Dispatch, SetStateAction, useCallback } from "react";

import {
  appendQuestion,
  DefinitionProblem,
  fieldChangePatch,
  fieldLabel,
  inputTypeOptions,
  insertQuestionBefore,
  moveQuestionBefore,
  parentQuestion,
  QuestionPosition,
  requiredChecklist,
  unmetDependency,
} from "../../formDefinition/formDefinitionChecks";
import { FieldDependency } from "../../formDefinition/handlerCatalogTypes";
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
  dependencies = [],
  registrationParentField = null,
  fieldLabels,
  problems = [],
}: {
  sections: SectionInput[];
  setSections: Dispatch<SetStateAction<SectionInput[]>>;
  handler: string;
  handlerFields: HandlerField[] | null;
  isMultipleSubmit?: boolean;
  // US2-13: what the registry catalog knows, so each question can say what
  // it needs (its column's types, a parent question) right where it's built.
  dependencies?: FieldDependency[];
  registrationParentField?: string | null;
  fieldLabels?: Record<string, string>;
  problems?: DefinitionProblem[];
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

  // [เพิ่มคำถามฟาร์มให้] / [ย้ายคำถามฟาร์มขึ้นมาก่อน]: fix a dependent
  // question (plot_id) whose parent (farm_id) is missing or comes after it.
  const fixDependency = useCallback(
    (
      child: QuestionPosition,
      parentField: string,
      parentPosition: QuestionPosition | null,
    ) => {
      setSections((prev) =>
        parentPosition
          ? moveQuestionBefore(prev, parentPosition, child)
          : insertQuestionBefore(
              prev,
              child,
              parentQuestion(parentField, handlerFields, fieldLabels),
            ),
      );
    },
    [fieldLabels, handlerFields, setSections],
  );

  const addRequiredField = useCallback(
    (fieldName: string) => {
      setSections((prev) =>
        appendQuestion(
          prev,
          parentQuestion(fieldName, handlerFields, fieldLabels),
        ),
      );
    },
    [fieldLabels, handlerFields, setSections],
  );

  const checklist = requiredChecklist(handlerFields, sections);
  // The one problem that isn't shown next to a single question.
  const duplicates = problems.filter((problem) => problem.kind === "duplicate");

  return (
    <>
      {(checklist.length > 0 || duplicates.length > 0) && (
        <Stack spacing={1}>
          {checklist.length > 0 && (
            <Stack
              direction={"row"}
              spacing={1}
              useFlexGap
              flexWrap={"wrap"}
              alignItems={"center"}
            >
              <Typography variant={"body2"}>
                {"ฟิลด์ที่ตารางนี้บังคับ:"}
              </Typography>
              {checklist.map(({ name, asked }) => (
                <Tooltip
                  key={name}
                  title={
                    asked
                      ? fieldLabel(name, fieldLabels)
                      : `ฟอร์มยังไม่มีคำถามนี้ ส่งไม่ผ่านแน่นอน กดเพื่อเพิ่มคำถาม '${fieldLabel(name, fieldLabels)}'`
                  }
                >
                  <Chip
                    size={"small"}
                    color={asked ? "success" : "error"}
                    variant={asked ? "outlined" : "filled"}
                    label={`${name} ${asked ? "✔" : "✘"}`}
                    onClick={asked ? undefined : () => addRequiredField(name)}
                  />
                </Tooltip>
              ))}
            </Stack>
          )}
          {duplicates.map((problem) => (
            <Alert key={problem.message} severity={"error"}>
              {problem.message}
            </Alert>
          ))}
        </Stack>
      )}
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
                <Stack
                  direction={"row"}
                  alignSelf={{ xs: "flex-end", md: "auto" }}
                >
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
                      <Typography
                        variant={"subtitle2"}
                        color={"text.secondary"}
                      >
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

                    <QuestionFieldAndType
                      question={question}
                      handler={handler}
                      handlerFields={handlerFields}
                      fieldLabels={fieldLabels}
                      dependencies={dependencies}
                      onChange={(patch) =>
                        updateQuestion(sectionIndex, questionIndex, patch)
                      }
                    />

                    <DependencyNotice
                      sections={sections}
                      position={{ sectionIndex, questionIndex }}
                      dependencies={dependencies}
                      registrationParentField={registrationParentField}
                      fieldLabels={fieldLabels}
                      onFix={fixDependency}
                    />

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

// Field first, then type: the column decides which types make sense, so the
// type list only offers those and picking a field pre-selects the first.
function QuestionFieldAndType({
  question,
  handler,
  handlerFields,
  fieldLabels,
  dependencies,
  onChange,
}: {
  question: QuestionInput;
  handler: string;
  handlerFields: HandlerField[] | null;
  fieldLabels?: Record<string, string>;
  dependencies: FieldDependency[];
  onChange: (patch: Partial<QuestionInput>) => void;
}) {
  const fieldName = question.fieldName ?? "";
  const field = handlerFields?.find((f) => f.name === fieldName);
  // A saved field_name that isn't a column of this table (e.g. "gis", or
  // farm_id on plot_breed) is kept, and labelled so the researcher knows
  // its answer only stays in the raw response.
  const isNonColumn = Boolean(fieldName && handlerFields && !field);
  // ...unless it's there to filter another question's choices
  // (plot_breed's farm_id, for plot_id): expected, not a mistake.
  const isFilterParent = dependencies.some((d) => d.parentField === fieldName);
  const typeOptions = inputTypeOptions(field, questionInputTypes);
  const typeFits = typeOptions.includes(question.inputType);

  return (
    <Stack spacing={1}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Select
          fullWidth
          size={"small"}
          displayEmpty
          value={fieldName}
          onChange={(e) =>
            onChange(fieldChangePatch(question, e.target.value, handlerFields))
          }
        >
          <MenuItem value={""} disabled>
            {!handler
              ? "select a handler first"
              : handlerFields === null
                ? "loading fields..."
                : "Select a field"}
          </MenuItem>
          {isNonColumn && (
            <MenuItem value={fieldName}>
              {`${fieldName} (ไม่ใช่คอลัมน์ของตารางนี้)`}
            </MenuItem>
          )}
          {handlerFields?.map((f) => (
            <MenuItem key={f.name} value={f.name}>
              {`${f.name}${f.required ? " *" : ""}`}
              {fieldLabels?.[f.name] && (
                <Typography
                  component={"span"}
                  variant={"body2"}
                  color={"text.secondary"}
                  marginLeft={1}
                  noWrap
                >
                  {fieldLabels[f.name]}
                </Typography>
              )}
            </MenuItem>
          ))}
        </Select>
        <Select
          fullWidth
          size={"small"}
          value={question.inputType}
          error={!typeFits}
          onChange={(e) =>
            onChange({ inputType: e.target.value as QuestionInputType })
          }
        >
          {!typeFits && (
            <MenuItem value={question.inputType} disabled>
              {questionInputTypeNameMap[question.inputType] ??
                question.inputType}
            </MenuItem>
          )}
          {typeOptions.map((type) => (
            <MenuItem key={type} value={type}>
              {questionInputTypeNameMap[type]}
            </MenuItem>
          ))}
        </Select>
      </Stack>
      {(field?.required || field?.dependsOn || isNonColumn || !typeFits) && (
        <Stack
          direction={"row"}
          spacing={1}
          useFlexGap
          flexWrap={"wrap"}
          alignItems={"center"}
        >
          {field?.required && (
            <Chip size={"small"} color={"primary"} label={"ฟิลด์บังคับ"} />
          )}
          {field?.dependsOn && (
            <Chip
              size={"small"}
              variant={"outlined"}
              label={`ต้องมี: ${fieldLabel(field.dependsOn, fieldLabels)}`}
            />
          )}
          {isNonColumn && (
            <Chip
              size={"small"}
              variant={"outlined"}
              color={isFilterParent ? "default" : "warning"}
              label={
                isFilterParent
                  ? "ใช้กรองตัวเลือก ไม่บันทึกลงตาราง"
                  : "ไม่ลงตาราง: เก็บเฉพาะในคำตอบดิบ"
              }
            />
          )}
          {!typeFits && (
            <FormHelperText error>
              {`คอลัมน์ ${fieldName} รับได้เฉพาะ ${typeOptions.join(" / ")}`}
            </FormHelperText>
          )}
        </Stack>
      )}
    </Stack>
  );
}

// "แปลงต้องมีฟาร์มก่อน" with a one-click fix: insert the parent question
// right above this one, or move the existing one up if it's below.
function DependencyNotice({
  sections,
  position,
  dependencies,
  registrationParentField,
  fieldLabels,
  onFix,
}: {
  sections: SectionInput[];
  position: QuestionPosition;
  dependencies: FieldDependency[];
  registrationParentField: string | null;
  fieldLabels?: Record<string, string>;
  onFix: (
    child: QuestionPosition,
    parentField: string,
    parentPosition: QuestionPosition | null,
  ) => void;
}) {
  const unmet = unmetDependency(
    sections,
    position,
    dependencies,
    registrationParentField,
  );
  if (!unmet) return null;
  const { dependency, parentPosition } = unmet;
  const childLabel =
    sections[position.sectionIndex].questions[
      position.questionIndex
    ].label.trim() || fieldLabel(dependency.childField, fieldLabels);
  const parentLabel = fieldLabel(dependency.parentField, fieldLabels);
  return (
    <Alert
      severity={"warning"}
      action={
        <Button
          color={"inherit"}
          size={"small"}
          onClick={() =>
            onFix(position, dependency.parentField, parentPosition)
          }
        >
          {parentPosition
            ? `ย้ายคำถาม '${parentLabel}' ขึ้นมาก่อน`
            : `เพิ่มคำถาม '${parentLabel}' ให้`}
        </Button>
      }
    >
      {`'${childLabel}' ต้องมีคำถาม '${parentLabel}' (${dependency.parentField}) อยู่ก่อน${parentPosition ? " แต่ตอนนี้อยู่หลังคำถามนี้" : ""} (${dependency.labelTh})`}
    </Alert>
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
