import { httpValidStatuses } from "../constants";

type QueryParams = Record<string, string | number | boolean | null | undefined>;

type GetRequestOption = {
  method: "GET";
};

type PostRequestOption = {
  method: "POST";
  body?: BodyInit;
};

type PutRequestOption = {
  method: "PUT";
  body?: BodyInit;
};

type PatchRequestOption = {
  method: "PATCH";
  body?: BodyInit;
};

type DeleteRequestOption = {
  method: "DELETE";
  body?: BodyInit;
};

type FetchOption = {
  headers?: HeadersInit;
  queryParams?: QueryParams;
  // FE-6: lets a caller cancel an in-flight request (e.g. a stale chart
  // fetch superseded by the user picking a different year) instead of
  // letting it resolve and overwrite fresher state.
  signal?: AbortSignal;
} & (
  | GetRequestOption
  | PostRequestOption
  | PutRequestOption
  | PatchRequestOption
  | DeleteRequestOption
);

type HttpValidStatus = (typeof httpValidStatuses)[number];

export type { FetchOption, HttpValidStatus, QueryParams };
