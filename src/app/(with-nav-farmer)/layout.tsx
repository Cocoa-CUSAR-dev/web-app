import NavigationBar from "@/components/NavigationBar";
import AuthWrapper from "@/providers/wrapper/AuthWrapper";

// Separate from (with-nav-authenticated)/layout.tsx, whose AuthWrapper
// defaults to admin/researcher only -- /history is farmer-facing (it's the
// caller's OWN submissions, gated server-side by read:response:own, a
// permission only the farmer role has). Nesting it under that layout would
// have blocked every farmer before reaching the page itself, since a parent
// layout's redirect runs before any child ever renders.
function WithNavFarmerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthWrapper allowRoles={["farmer", "admin", "researcher"]}>
      <NavigationBar>{children}</NavigationBar>
    </AuthWrapper>
  );
}

export default WithNavFarmerLayout;
