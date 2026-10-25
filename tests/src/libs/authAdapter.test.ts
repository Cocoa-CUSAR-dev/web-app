import { describe, expect, it } from "vitest";

import { type BackendMe, toAuthValue } from "@/libs/authAdapter";

function me(overrides: Partial<BackendMe> = {}): BackendMe {
  return {
    user_id: "u-1",
    username: "r@test.com",
    roles: ["researcher"],
    must_reset_password: false,
    profiles: {
      researcher: { first_name: "R", last_name: "S", organization: "Chula" },
    },
    ...overrides,
  };
}

describe("toAuthValue", () => {
  it("flattens the account and its researcher profile", () => {
    expect(toAuthValue(me())).toEqual({
      userId: "u-1",
      email: "r@test.com",
      firstName: "R",
      lastName: "S",
      organization: "Chula",
      roles: ["researcher"],
      isRequiresPasswordReset: false,
      isPasswordReset: true,
    });
  });

  it("asks an admin-made account that has not chosen a password to reset it", () => {
    const value = toAuthValue(me({ must_reset_password: true }));

    // AuthWrapper sends the person to reset-password when the first is true
    // and the second is false.
    expect(value.isRequiresPasswordReset).toBe(true);
    expect(value.isPasswordReset).toBe(false);
  });

  it("takes the name from another role when the person has no researcher profile", () => {
    const value = toAuthValue(
      me({
        roles: ["admin", "farmer"],
        profiles: {
          researcher: null,
          farmer: { first_name: "Somchai", last_name: "Jaidee" },
        },
      }),
    );

    expect(value.firstName).toBe("Somchai");
    expect(value.lastName).toBe("Jaidee");
    expect(value.organization).toBe("");
  });

  it("leaves the name empty for an account with no profile at all", () => {
    const value = toAuthValue(me({ roles: ["admin"], profiles: {} }));

    expect(value.firstName).toBe("");
    expect(value.lastName).toBe("");
    expect(value.email).toBe("r@test.com");
  });
});
