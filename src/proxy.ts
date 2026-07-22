import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { publicPaths, tokenName } from "./core/constants";

export function proxy(req: NextRequest) {
  const { nextUrl, cookies } = req;
  const { searchParams, pathname } = nextUrl;
  const token = cookies.get(tokenName);

  // development purpose
  const NODE_ENV = process.env.NODE_ENV;
  if (pathname.startsWith("/debug") && NODE_ENV === "development") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/auth") && searchParams.get("clear") === "true") {
    const newUrl = new URL(req.url);
    newUrl.searchParams.delete("clear");

    const response = NextResponse.redirect(newUrl);

    response.cookies.delete(tokenName);

    return response;
  }

  const matchedPath = publicPaths.find((p) =>
    p.type === "EXACT"
      ? pathname === p.path
      : pathname.trim().startsWith(p.path),
  );

  if (pathname.startsWith("/auth")) {
    if (token && searchParams.get("page") !== "reset-password") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (!token && searchParams.get("page") === "reset-password") {
      return NextResponse.redirect(new URL("/auth?page=login", req.url));
    }

    const pageParam = searchParams.get("page");
    if (
      !pageParam ||
      !["login", "register", "reset-password"].includes(pageParam)
    ) {
      return NextResponse.redirect(new URL("/auth?page=login", req.url));
    }

    return NextResponse.next();
  }

  if (!token && !matchedPath) {
    return NextResponse.redirect(new URL("/auth?page=login", req.url));
  }

  return NextResponse.next();
}
