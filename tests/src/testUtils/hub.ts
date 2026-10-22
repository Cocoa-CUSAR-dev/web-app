// backend-hub test doubles: token pairs and JWTs with a chosen expiry.

/** An unsigned JWT-shaped token whose `exp` is `seconds` from now. The web
 * app only reads `exp`; the hub checks signatures. */
function jwtExpiringIn(seconds: number): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
  const exp = Math.floor(Date.now() / 1000) + seconds;
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: "u-1", exp })}.sig`;
}

function tokenPair(overrides: Partial<{ access_token: string; refresh_token: string }> = {}) {
  return {
    access_token: overrides.access_token ?? jwtExpiringIn(3600),
    refresh_token: overrides.refresh_token ?? "refresh-1",
    token_type: "bearer",
    expires_in: 3600,
    user: {
      user_id: "u-1",
      username: "r@test.com",
      roles: ["researcher"],
      must_reset_password: false,
    },
  };
}

function hubJson(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export { hubJson, jwtExpiringIn, tokenPair };
