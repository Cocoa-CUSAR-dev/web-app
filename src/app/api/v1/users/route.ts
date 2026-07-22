export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendUrl, tokenName } from "@/core/constants";
import { HttpError } from "@/core/error";
import { AdminAddUserReqType } from "@/core/types";
import { checkTokenPresence, handleApiError } from "@/libs/apiUtil";

async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(tokenName);
    if (!token || !token.value) {
      return NextResponse.json(
        { error: "missing authorization token" },
        { status: 400 },
      );
    }
    const params = req.nextUrl.searchParams;
    const id = params.get("id");
    if (id) {
      // find id
    } else {
      // find all
    }
  } catch (e) {
    if (e instanceof HttpError) {
      console.error(`HTTP ${e.status}: ${e.message}`);
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
  }
}

async function POST(req: NextRequest) {
  try {
    checkTokenPresence(req);
    const { cookies } = req;
    const token = cookies.get(tokenName);
    const { username, password } = (await req.json()) as AdminAddUserReqType;
    if (!username || !password) {
      return NextResponse.json(
        {
          error: "missing username or password",
        },
        {
          status: 400,
        },
      );
    }
    const response = await fetch(`${backendUrl}/api/v1/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${token!.name}=${token!.value}`,
      },
      body: JSON.stringify({
        username,
        password,
      }),
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
    const data = await response.json();
    console.log(data);
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
