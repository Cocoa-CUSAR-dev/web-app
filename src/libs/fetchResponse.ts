import { httpValidStatuses } from "@/core/constants";
import { HttpError } from "@/core/error";
import { FetchOption, QueryParams } from "@/core/types";

const defaultHeaders = {
  headers: {
    "Content-Type": "application/json",
  },
};

async function fetchResponse(path: string, fetchOption: FetchOption) {
  const { headers, method, queryParams } = fetchOption;
  const body = "body" in fetchOption ? fetchOption.body : undefined;
  const encodedQueryParams = queryParams ? encodeQueryParams(queryParams) : "";
  const finalPath = path + encodedQueryParams;
  try {
    const response = await fetch(finalPath, {
      method: method,
      headers: headers ?? defaultHeaders.headers,
      body: body,
    });
    if (!response.ok) {
      // httpValidStatuses is a `readonly [100, 101, ...]` literal tuple
      // (`as const`), so its own .includes() signature only accepts one of
      // those literal values -- widen to plain numbers here since
      // response.status is a runtime number, not a literal.
      if ((httpValidStatuses as readonly number[]).includes(response.status)) {
        throw new HttpError(response.status, response.statusText);
      } else {
        throw new Error(`Error: ${response.status}, ${response.statusText}`);
      }
    }
    return response;
  } catch (e) {
    console.error(
      e instanceof Error ? `${e.name}:${e.message}` : "Unknown Error",
    );
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
