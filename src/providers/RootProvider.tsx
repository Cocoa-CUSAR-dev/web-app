import { Toaster } from "react-hot-toast";

import { BreadcrumbsProvider } from "@/hooks/useBreadcrumbs";
import GlobalLoadingProvider from "@/hooks/useGlobalLoading";

function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <GlobalLoadingProvider>
      <BreadcrumbsProvider>
        {children}
        <Toaster />
      </BreadcrumbsProvider>
    </GlobalLoadingProvider>
  );
}

export default RootProvider;
