import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import FormCreateModule from "@/modules/form/route-form-create/FormCreateModule";

// These tests drive the whole page through real MUI controls (selects, toggle
// buttons, autocompletes), which is slow when the full suite runs in parallel,
// so: no artificial delay between key presses, and room to finish.
vi.setConfig({ testTimeout: 30_000 });
const user = userEvent.setup({ delay: null });

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/hooks/useAuthInfo", () => ({
  useAuthInfo: () => ({ roles: ["researcher"], isAuthenticated: true }),
}));
const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock("@/components/utility/CustomToast", () => ({
  CustomToast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
    dismiss: vi.fn(),
  },
}));

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

// Every call the page makes: the catalogs it loads, the recipient pickers,
// and the POST that creates the form (answered by `create`).
function stubBackend(create: () => Response) {
  vi.mocked(fetch).mockImplementation(async (input, init) => {
    const url = String(input);
    if (init?.method === "POST") return create();
    if (url.endsWith("/forms/handlers")) {
      return jsonResponse({ value: ["farm_activity"] });
    }
    if (url.includes("/forms/handlers/")) return jsonResponse({ value: [] });
    if (url.includes("recipient-options/roles")) {
      return jsonResponse({
        value: [{ roleId: "role-farmer", roleName: "farmer" }],
      });
    }
    if (url.includes("recipient-options/users")) {
      return jsonResponse({ value: [] });
    }
    return jsonResponse({ value: [] });
  });
}

function postedBody() {
  const call = vi
    .mocked(fetch)
    .mock.calls.find(([, init]) => init?.method === "POST");
  return JSON.parse(call![1]!.body as string);
}

// Fills in everything the page needs before "Create Form" is enabled.
async function fillTheBasics() {
  await user.type(screen.getByLabelText("Title"), "Daily check");
  fireEvent.change(screen.getByLabelText("Open At"), {
    target: { value: "2026-10-05T08:00" },
  });
  fireEvent.change(screen.getByLabelText("Close At"), {
    target: { value: "2026-10-05T17:00" },
  });
  await user.click(await screen.findByText("Select a handler"));
  await user.click(
    await screen.findByRole("option", { name: "farm_activity" }),
  );
  await user.type(screen.getByLabelText("Section Title"), "Main");
  await user.type(screen.getByLabelText("Label"), "Note");
}

async function chooseFrequency(label: string) {
  await user.click(screen.getByRole("combobox", { name: "Repeat" }));
  await user.click(await screen.findByRole("option", { name: label }));
}

describe("FormCreateModule: repeat and recipients (US4-4)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("sends neither a repeat rule nor recipients for an ordinary one-off task", async () => {
    stubBackend(() => jsonResponse({ value: { formId: "f1" } }, 201));
    render(<FormCreateModule />);

    await fillTheBasics();
    await user.click(screen.getByRole("button", { name: "Create Form" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/form/form-edit"));
    const body = postedBody();
    expect(body).not.toHaveProperty("recurrence");
    expect(body).not.toHaveProperty("recipients");
    expect(body.title).toBe("Daily check");
  });

  it("sends a weekly rule with its weekdays in order, and the chosen recipients", async () => {
    stubBackend(() => jsonResponse({ value: { formId: "f1" } }, 201));
    render(<FormCreateModule />);

    await fillTheBasics();
    await chooseFrequency("Every week");
    await user.click(screen.getByRole("button", { name: "Thu" }));
    await user.click(screen.getByRole("button", { name: "Mon" }));
    fireEvent.change(screen.getByLabelText(/Stop repeating after/), {
      target: { value: "2026-12-31" },
    });
    await user.click(screen.getByLabelText("Roles (e.g. farmer)"));
    await user.click(await screen.findByRole("option", { name: "farmer" }));
    await user.click(screen.getByRole("button", { name: "Create Form" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/form/form-edit"));
    const body = postedBody();
    expect(body.recurrence).toEqual({
      frequency: "WEEKLY",
      weekdays: [1, 4],
      untilDate: "2026-12-31",
    });
    // Only type and id go to the backend, not the display label.
    expect(body.recipients).toEqual([{ type: "ROLE", id: "role-farmer" }]);
    expect(toastSuccess).toHaveBeenCalled();
  });

  it("sends a daily rule without weekdays or an end date when none were set", async () => {
    stubBackend(() => jsonResponse({ value: { formId: "f1" } }, 201));
    render(<FormCreateModule />);

    await fillTheBasics();
    await chooseFrequency("Every day");
    await user.click(screen.getByRole("button", { name: "Create Form" }));

    await waitFor(() => expect(push).toHaveBeenCalled());
    expect(postedBody().recurrence).toEqual({ frequency: "DAILY" });
  });

  it("will not create a weekly task until a weekday is picked", async () => {
    stubBackend(() => jsonResponse({ value: { formId: "f1" } }, 201));
    render(<FormCreateModule />);

    await fillTheBasics();
    await chooseFrequency("Every week");

    expect(screen.getByRole("button", { name: "Create Form" })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Pick at least one weekday",
    );

    await user.click(screen.getByRole("button", { name: "Mon" }));
    expect(screen.getByRole("button", { name: "Create Form" })).toBeEnabled();
  });

  it("shows the backend's reason, and stays on the page, when the form is refused", async () => {
    stubBackend(() =>
      jsonResponse(
        { error: "The chosen recipients do not match any user" },
        400,
      ),
    );
    render(<FormCreateModule />);

    await fillTheBasics();
    await user.click(screen.getByLabelText("Roles (e.g. farmer)"));
    await user.click(await screen.findByRole("option", { name: "farmer" }));
    await user.click(screen.getByRole("button", { name: "Create Form" }));

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        "failed to create form, please try again",
        "The chosen recipients do not match any user",
        expect.anything(),
      ),
    );
    expect(push).not.toHaveBeenCalled();
    // Can be fixed and sent again.
    expect(screen.getByRole("button", { name: "Create Form" })).toBeEnabled();
  });
});
