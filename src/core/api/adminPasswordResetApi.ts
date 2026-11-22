import "client-only";

type PasswordReset = { username: string; temporaryPassword: string };

const adminPasswordResetApi = {
  /** Give the account a temporary password; the answer carries it, once. */
  reset: async (login: string): Promise<PasswordReset> => {
    const response = await fetch("/api/v1/admin/password-resets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login }),
    });
    if (!response.ok) {
      let message = response.statusText;
      try {
        const data = (await response.json()) as { error?: string };
        if (data.error) message = data.error;
      } catch {
        // not JSON: keep the status text
      }
      throw new Error(
        response.status === 404 ? "No account matches that login." : message,
      );
    }
    const { value } = (await response.json()) as {
      value: { username: string; temporary_password: string };
    };
    return {
      username: value.username,
      temporaryPassword: value.temporary_password,
    };
  },
} as const;

export { adminPasswordResetApi };
