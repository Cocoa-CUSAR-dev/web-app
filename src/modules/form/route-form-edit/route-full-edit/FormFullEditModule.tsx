"use client";

import {
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

import { CustomToast } from "@/components/utility/CustomToast";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import { fetchResponse } from "@/libs/fetchResponse";

import SectionQuestionEditor, {
  isSectionsValid,
} from "../../route-form-create/components/SectionQuestionEditor";
import {
  HandlerField,
  HandlerFieldsResponse,
  SectionInput,
  UpdateFormRequest,
} from "../../route-form-create/formCreateTypes";
import { GetFormIdResponse, GetFormsResponse } from "../formEditTypes";

function FormFullEditModuleInner() {
  const { roles, isAuthenticated } = useAuthInfo();
  const isPageLoading = Boolean(!roles);
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = searchParams.get("formId");
  const toastIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && !roles) {
      router.push("/");
    }
  }, [isAuthenticated, roles, router]);

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [handler, setHandler] = useState<string>("");
  const [sections, setSections] = useState<SectionInput[]>([]);
  const [handlerFields, setHandlerFields] = useState<HandlerField[] | null>(
    null,
  );
  const [loadingForm, setLoadingForm] = useState<boolean>(true);
  const [boxLoading, setBoxLoading] = useState<boolean>(false);

  const loadForm = useCallback(async () => {
    if (!formId) return;
    setLoadingForm(true);
    try {
      const [formResponse, listResponse] = await Promise.all([
        fetchResponse(`/api/v1/forms/${formId}`, { method: "GET" }),
        fetchResponse("/api/v1/forms", { method: "GET" }),
      ]);
      const { value: form }: GetFormIdResponse = await formResponse.json();
      const { value: allForms }: GetFormsResponse = await listResponse.json();
      const listEntry = allForms.find((f) => f.formId === formId);

      setTitle(form.title);
      setDescription(form.description ?? "");
      setHandler(listEntry?.handler ?? "");
      setSections(
        form.sections.map((section) => ({
          sectionId: section.sectionId,
          title: section.title,
          description: section.description,
          isActive: section.isActive,
          sortOrder: section.sortOrder,
          questions: section.questions.map((question) => ({
            questionId: question.questionId,
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
      CustomToast.error("failed to load the form", undefined, {
        duration: 5000,
      });
    } finally {
      setLoadingForm(false);
    }
  }, [formId]);

  useEffect(() => {
    loadForm();
  }, [loadForm]);

  useEffect(() => {
    if (!handler) {
      setHandlerFields(null);
      return;
    }
    (async () => {
      try {
        const response = await fetchResponse(
          `/api/v1/forms/handlers/${handler}/fields`,
          { method: "GET" },
        );
        const { value }: HandlerFieldsResponse = await response.json();
        setHandlerFields(value);
      } catch (e) {
        console.error(e);
        setHandlerFields([]);
      }
    })();
  }, [handler]);

  const isFormValid = isSectionsValid(sections);

  const handleSubmit = useCallback(async () => {
    if (!formId || !isFormValid) return;
    if (toastIdRef.current) {
      CustomToast.dismiss(toastIdRef.current);
    }
    try {
      setBoxLoading(true);
      const toastId = "form-full-edit-toast-id";
      toastIdRef.current = toastId;

      const body: UpdateFormRequest = {
        description: description.trim() || null,
        sections: sections.map((section, sectionIndex) => ({
          sectionId: section.sectionId,
          title: section.title,
          description: section.description?.trim() || null,
          isActive: true,
          sortOrder: sectionIndex,
          questions: section.questions.map((question, questionIndex) => ({
            questionId: question.questionId,
            label: question.label,
            description: question.description?.trim() || null,
            inputType: question.inputType,
            fieldName: question.fieldName || null,
            isMandatory: question.isMandatory,
            sortOrder: questionIndex,
          })),
        })),
      };

      await CustomToast.promise(
        fetchResponse(`/api/v1/forms/${formId}`, {
          method: "PUT",
          body: JSON.stringify(body),
        }),
        {
          loading: "saving form...",
          success: "form saved successfully",
          error: "failed to save form, please try again",
        },
        undefined,
        {
          duration: 3000,
          id: toastId,
        },
      );
      await loadForm();
    } catch (e) {
      console.error(e);
    } finally {
      setBoxLoading(false);
    }
  }, [description, formId, isFormValid, loadForm, sections]);

  if (!formId) {
    return (
      <Typography>
        {"Missing formId — open this page from Form Edit's Full Edit button."}
      </Typography>
    );
  }

  if (isPageLoading || loadingForm) {
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
      <Typography variant={"h2"}>{`Full Edit — ${title}`}</Typography>
      <Typography variant={"body2"} color={"text.secondary"}>
        {`Handler: ${handler || "unknown"} (fixed — create a new form to change it)`}
      </Typography>

      <TextField
        fullWidth
        size={"small"}
        label={"Description"}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

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
          {"Save Changes"}
        </Button>
      </Stack>
    </Stack>
  );
}

function FormFullEditModule() {
  return (
    <Suspense fallback={<Box width={"100%"} height={"100%"} />}>
      <FormFullEditModuleInner />
    </Suspense>
  );
}

export default FormFullEditModule;
