import { useEffect, useState } from "react";

import { fetchResponse } from "@/libs/fetchResponse";

import { HandlerCatalog, HandlerCatalogResponse } from "./handlerCatalogTypes";

// Kotlin rejects a form it can't save with a 400 whose `error` lists every
// problem, one per line (FormDefinitionValidator). fetchResponse keeps only
// the status text, so the builder posts through here to keep those lines
// and show them to the researcher.
class FormSaveError extends Error {
  messages: string[];
  constructor(messages: string[]) {
    super(messages.join("\n"));
    this.name = "FormSaveError";
    this.messages = messages;
  }
}

async function saveFormDefinition(
  path: string,
  method: "POST" | "PUT",
  body: unknown,
): Promise<Response> {
  const response = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (response.ok) return response;

  let error: unknown = null;
  try {
    ({ error } = await response.json());
  } catch {
    // not JSON -- fall back to the status below
  }
  const messages =
    typeof error === "string" && error.trim()
      ? error
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
      : [`Error: ${response.status}, ${response.statusText}`];
  throw new FormSaveError(messages);
}

// The registry catalog, for Thai handler/field labels, the handler's parent
// field and the field dependencies. null while loading; a failed load gives
// an empty catalog so the builder still works (Kotlin still checks on save).
function useHandlerCatalog(): HandlerCatalog | null {
  const [catalog, setCatalog] = useState<HandlerCatalog | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const response = await fetchResponse("/api/v1/forms/handlers/catalog", {
          method: "GET",
        });
        const { value }: HandlerCatalogResponse = await response.json();
        setCatalog(value);
      } catch (e) {
        console.error(e);
        setCatalog({
          handlers: [],
          dependencies: [],
          registrationTables: [],
          fieldLabels: {},
        });
      }
    })();
  }, []);
  return catalog;
}

export { FormSaveError, saveFormDefinition, useHandlerCatalog };
