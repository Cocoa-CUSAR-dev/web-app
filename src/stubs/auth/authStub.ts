import { AuthResponseType } from "@/core/types";

const authResponseStub: AuthResponseType["value"] = {
  firstName: "Thanachai",
  lastName: "Lamwonduan",
  email: "example.1234@example.com",
  organization: "CUSAR",
  isPasswordReset: true,
  isRequiresPasswordReset: false,
  roles: ["researcher", "admin"],
};

export { authResponseStub };
