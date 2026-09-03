import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendUrl, tokenName } from "@/core/constants";
import { HttpError } from "@/core/error";
import { apiErrorResponse, checkTokenPresence } from "@/libs/apiUtil";

// Not migrated to proxyToBackend: this streams the raw response body
// (an .xlsx file) straight through rather than parsing it as JSON, so it
// doesn't fit that helper's shape. The catch block still gets the shared
// apiErrorResponse treatment.
async function GET(req: NextRequest) {
  try {
    checkTokenPresence(req);
    const {
      cookies,
      nextUrl: { searchParams },
    } = req;
    const sheets = searchParams.get("sheets");
    const sheetsString = sheets ? `?sheets=${sheets.toUpperCase()}` : "";
    const token = cookies.get(tokenName);
    const response = await fetch(
      `${backendUrl}/api/v1/reports/raw-data/download${sheetsString}`,
      {
        method: "GET",
        headers: {
          Cookie: `${token!.name}=${token!.value}`,
        },
      },
    );
    if (!response.ok) {
      const { error } = await response.json();
      const setCookie = response.headers.getSetCookie();
      throw new HttpError(
        response.status,
        error ?? response.statusText,
        setCookie,
      );
    }
    const contentType =
      response.headers.get("Content-Type") || "application/octet-stream";
    const contentDisposition =
      response.headers.get("Content-Disposition") ||
      'attachment; filename="download"';
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
        "Content-Length": response.headers.get("content-length") || "",
      },
    });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { GET };
