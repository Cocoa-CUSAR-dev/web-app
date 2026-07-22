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
} & (
  | GetRequestOption
  | PostRequestOption
  | PutRequestOption
  | PatchRequestOption
  | DeleteRequestOption
);

type HttpValidStatus = (typeof httpValidStatuses)[number];

export type { FetchOption, HttpValidStatus, QueryParams };
