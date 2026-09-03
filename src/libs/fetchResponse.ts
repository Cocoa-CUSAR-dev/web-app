import { httpValidStatuses } from "@/core/constants";
import { HttpError } from "@/core/error";
import { FetchOption, QueryParams } from "@/core/types";

const defaultHeaders = {
  headers: {
    "Content-Type": "application/json",
  },
};

async function fetchResponse(path: string, fetchOption: FetchOption) {
  const { headers, method, queryParams, signal } = fetchOption;
  const body = "body" in fetchOption ? fetchOption.body : undefined;
  const encodedQueryParams = queryParams ? encodeQueryParams(queryParams) : "";
  const finalPath = path + encodedQueryParams;
  try {
    const response = await fetch(finalPath, {
      method: method,
      headers: headers ?? defaultHeaders.headers,
      body: body,
      signal,
    });
    if (!response.ok) {
      if ((httpValidStatuses as readonly number[]).includes(response.status)) {
        throw new HttpError(response.status, response.statusText);
      } else {
        throw new Error(`Error: ${response.status}, ${response.statusText}`);
      }
    }
    return response;
  } catch (e) {
    // FE-6: a caller-cancelled request (AbortController.abort()) rejects
    // here too -- that's expected/routine now that callers pass a signal
    // (e.g. a stale chart request superseded by a new one), not a real
    // failure worth an error-level log.
    const isAbort = e instanceof DOMException && e.name === "AbortError";
    if (!isAbort) {
      console.error(
        e instanceof Error ? `${e.name}:${e.message}` : "Unknown Error",
      );
    }
    throw e;
  }
}

function encodeQueryParams(queryParams: QueryParams) {
  const params = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      params.append(key, value.toString());
    }
  });
  return params.toString();
}

export { fetchResponse };
