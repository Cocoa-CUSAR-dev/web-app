import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendUrl, tokenName } from "@/core/constants";
import { HttpError } from "@/core/error";
import { checkTokenPresence, handleApiError } from "@/libs/apiUtil";
import {
  CreateFormRequest,
  CreateFormResponse,
} from "@/modules/form/route-form-create/formCreateTypes";
import { GetFormsResponse } from "@/modules/form/route-form-edit/formEditTypes";

async function GET(req: NextRequest) {
  try {
    checkTokenPresence(req);
    const { cookies } = req;
    const token = cookies.get(tokenName);
    const response = await fetch(`${backendUrl}/api/v1/forms`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${token!.name}=${token!.value}`,
      },
    });
    if (!response.ok) {
      const { error } = await response.json();
      const setCookie = response.headers.getSetCookie();
      throw new HttpError(
        response.status,
        error ?? response.statusText,
        setCookie,
      );
    }
    const data = (await response.json()) as GetFormsResponse;
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    handleApiError(e);
    if (e instanceof HttpError) {
      const res = NextResponse.json(
        {
          error: e.message,
        },
        {
          status: e.status,
        },
      );
      if (e.setCookies && e.setCookies.length > 0) {
        e.setCookies.forEach((cookieString) => {
          res.headers.append("Set-Cookie", cookieString);
        });
      }
      return res;
    }
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}

async function POST(req: NextRequest) {
  try {
    checkTokenPresence(req);
    const { cookies } = req;
    const token = cookies.get(tokenName);
    const body = (await req.json()) as CreateFormRequest;
    if (!body.title || !body.handler || !body.sections?.length) {
      return NextResponse.json(
        {
          error: "missing title, handler, or sections",
        },
        {
          status: 400,
        },
      );
    }
    const response = await fetch(`${backendUrl}/api/v1/forms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${token!.name}=${token!.value}`,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const { error } = await response.json();
      const setCookie = response.headers.getSetCookie();
      throw new HttpError(
        response.status,
        error ?? response.statusText,
        setCookie,
      );
    }
    const data = (await response.json()) as CreateFormResponse;
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    handleApiError(e);
    if (e instanceof HttpError) {
      const res = NextResponse.json(
        {
          error: e.message,
        },
        {
          status: e.status,
        },
      );
      if (e.setCookies && e.setCookies.length > 0) {
        e.setCookies.forEach((cookieString) => {
          res.headers.append("Set-Cookie", cookieString);
        });
      }
      return res;
    }
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}

export { GET, POST };
