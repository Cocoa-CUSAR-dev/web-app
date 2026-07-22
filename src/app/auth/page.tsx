import { Suspense } from "react";

import AuthModule from "@/modules/auth/AuthModule";

function Auth() {
  return (
    <Suspense>
      <AuthModule />;
    </Suspense>
  );
}

export default Auth;
