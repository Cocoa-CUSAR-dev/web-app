import { Box } from "@mui/material";

import AuthWrapper from "@/providers/wrapper/AuthWrapper";

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthWrapper
      redirectNotAllowUrl="/"
      allowRoles={["admin"]}
      requireResetPasswordCheck={false}
    >
      <Box width={"100%"} height={"100dvh"}>
        {children}
      </Box>
    </AuthWrapper>
  );
}

export default AdminLayout;
