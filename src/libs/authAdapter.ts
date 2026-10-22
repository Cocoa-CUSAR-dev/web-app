import type { AuthResponseType, UserRole } from "@/core/types";

// What GET /api/v1/me answers: one account, every role it holds, and each
// role's own profile (null for a role the person does not have).
type RoleProfile = {
  first_name?: string | null;
  last_name?: string | null;
  organization?: string | null;
} | null;

type BackendMe = {
  user_id: string;
  username: string;
  roles: string[];
  must_reset_password: boolean;
  profiles: {
    researcher?: RoleProfile;
    farmer?: RoleProfile;
    hub_collector?: RoleProfile;
    processor?: RoleProfile;
  };
};

type AuthValue = NonNullable<AuthResponseType["value"]>;

// The pages read one flat user. The researcher profile comes first because
// this is the researchers' web app; the name of another role fills in only
// when the person has no researcher profile (an admin who never was one).
function toAuthValue(me: BackendMe): AuthValue {
  const { researcher, farmer, hub_collector, processor } = me.profiles ?? {};
  const named = [researcher, farmer, hub_collector, processor].find(
    (profile) => profile?.first_name || profile?.last_name,
  );
  return {
    userId: me.user_id,
    email: me.username,
    firstName: named?.first_name ?? "",
    lastName: named?.last_name ?? "",
    organization: researcher?.organization ?? "",
    roles: me.roles as UserRole[],
    // must_reset_password is "an admin made this account and the person has
    // not chosen a password yet": the old pair of flags, in one.
    isRequiresPasswordReset: me.must_reset_password,
    isPasswordReset: !me.must_reset_password,
  };
}

export type { BackendMe };
export { toAuthValue };
