import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendUrl, tokenName } from "@/core/constants";
import { HttpError } from "@/core/error";
import { checkTokenPresence, handleApiError } from "@/libs/apiUtil";
import {
  UpdateFormRequest,
  UpdateFormResponse,
} from "@/modules/form/route-form-create/formCreateTypes";
import { GetFormIdResponse } from "@/modules/form/route-form-edit/formEditTypes";

async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    checkTokenPresence(req);
    const { cookies } = req;
    const token = cookies.get(tokenName);
    const { id } = await params;
    const response = await fetch(`${backendUrl}/api/v1/forms/${id}`, {
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
    const data = (await response.json()) as GetFormIdResponse;
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    handleApiError(e);
    if (e instanceof HttpError) {
      return NextResponse.json(
        {
          error: e.message,
        },
        {
          status: e.status,
        },
      );
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

async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    checkTokenPresence(req);
    const { cookies } = req;
    const token = cookies.get(tokenName);
    const { id } = await params;
    const body = (await req.json()) as UpdateFormRequest;
    if (!body.sections?.length) {
      throw new HttpError(400, "missing form section body");
    }
    const response = await fetch(`${backendUrl}/api/v1/forms/${id}`, {
      method: "PUT",
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
    const data = (await response.json()) as UpdateFormResponse;
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

export { GET, PUT };
