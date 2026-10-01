import { cookies } from "next/headers";

import { serverAuthApi } from "@/core/api/serverAuthApi";
import { AuthInfoProvider } from "@/hooks/useAuthInfo";

// For public pages (e.g. the landing page) that want to reflect real login
// state -- unlike AuthWrapper, this never redirects: an anonymous visitor
// just gets isAuthenticated: false and stays on the page.
async function OptionalAuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieString = (await cookies()).toString();
  const authData = await serverAuthApi.authMe(cookieString).catch(() => null);

  return <AuthInfoProvider value={authData}>{children}</AuthInfoProvider>;
}

export default OptionalAuthWrapper;

export const dynamic = "force-dynamic";
