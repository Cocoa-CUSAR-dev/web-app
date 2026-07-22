import { DefaultResponseType } from ".";

type UserRole =
  | "admin"
  | "researcher"
  | "farmer"
  | "processor"
  | "hub_collector";

type AuthUser = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  organization: string;
  isPasswordReset: boolean;
  isRequiresPasswordReset: boolean;
  roles: UserRole[];
};

type AuthInfoContextType = Partial<AuthUser> & {
  isAuthenticated: boolean;
  logout: () => Promise<void | boolean>;
};

type AuthResponseType = DefaultResponseType<Pick<
  AuthInfoContextType,
  | "userId"
  | "email"
  | "firstName"
  | "lastName"
  | "roles"
  | "organization"
  | "isPasswordReset"
  | "isRequiresPasswordReset"
> | null>;

type LoginRequestType = {
  username: string;
  password: string;
};

type AdminAddUserReqType = {
  username: string;
  password: string;
};

type AuthResetPasswordReqType = {
  newPassword: string;
};

export type {
  AdminAddUserReqType,
  AuthInfoContextType,
  AuthResetPasswordReqType,
  AuthResponseType,
  LoginRequestType,
  UserRole,
};
