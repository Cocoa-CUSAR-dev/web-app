import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { serverAuthApi } from "@/core/api/serverAuthApi";
import { CustomRedirectError } from "@/core/error";
import { UserRole } from "@/core/types";
import { AuthInfoProvider } from "@/hooks/useAuthInfo";

async function getAuthData(cookie: string) {
  const response = await serverAuthApi.authMe(cookie);
  return response;
}

async function AuthWrapper({
  children,
  allowRoles = ["admin", "researcher"],
  redirectResetPasswordUrl = "/auth?page=reset-password",
  redirectNotAllowUrl = "/",
  requireResetPasswordCheck = false,
}: {
  children: React.ReactNode;
  allowRoles?: UserRole[];
  redirectResetPasswordUrl?: string;
  redirectNotAllowUrl?: string;
  requireResetPasswordCheck?: boolean;
}) {
  const cookieString = (await cookies()).toString();
  let authData = null;

  try {
    authData = await getAuthData(cookieString);
  } catch (err) {
    console.error("AuthWrapper error:", err);
    if (err instanceof CustomRedirectError) {
      redirect(err.message);
    }
  }

  const isAllowed =
    authData?.roles?.some((r) => allowRoles.includes(r)) ?? false;

  if (
    requireResetPasswordCheck &&
    authData?.isRequiresPasswordReset &&
    !authData?.isPasswordReset
  ) {
    console.log("redirect from password reset");
    redirect(redirectResetPasswordUrl);
  }

  if (!isAllowed) {
    console.log("redirect from not allowed role");
    redirect(redirectNotAllowUrl);
  }

  return <AuthInfoProvider value={authData}>{children}</AuthInfoProvider>;
}

export default AuthWrapper;

export const dynamic = "force-dynamic";
