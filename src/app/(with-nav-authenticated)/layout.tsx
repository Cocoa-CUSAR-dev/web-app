import NavigationBar from "@/components/NavigationBar";
import AuthWrapper from "@/providers/wrapper/AuthWrapper";

function WithNavLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthWrapper requireResetPasswordCheck={true}>
      <NavigationBar>{children}</NavigationBar>
    </AuthWrapper>
  );
}

export default WithNavLayout;
