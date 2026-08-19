"use client";

import {
  Button,
  CircularProgress,
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

import {
  GetFormIdResponse,
  GetFormsResponse,
} from "../route-form-edit/formEditTypes";
import SectionQuestionEditor, {
  emptySection,
  isSectionsValid,
} from "./components/SectionQuestionEditor";
import {
  CreateFormRequest,
  HandlerField,
  HandlerFieldsResponse,
  HandlersResponse,
  SectionInput,
} from "./formCreateTypes";

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

  // #region validation
  const isFormValid =
    Boolean(title.trim()) &&
    Boolean(handler.trim()) &&
    Boolean(openAt) &&
    Boolean(closeAt) &&
    isSectionsValid(sections);

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

      <SectionQuestionEditor
        sections={sections}
        setSections={setSections}
        handler={handler}
        handlerFields={handlerFields}
      />

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
