export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { apiErrorResponse } from "@/libs/apiUtil";

// FE-1 (out of scope here): this still never actually calls the backend --
// only the duplicated catch-block shape was in scope for this change.
async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "missing email or password" },
        { status: 400 },
      );
    }
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { POST };
