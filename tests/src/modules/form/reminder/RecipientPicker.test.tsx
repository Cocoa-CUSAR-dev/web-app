import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import RecipientPicker from "@/modules/form/reminder/RecipientPicker";
import { ReminderRecipient } from "@/modules/form/reminder/reminderTypes";

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200 });
}

function stubOptions() {
  vi.mocked(fetch).mockImplementation(async (input) => {
    const url = String(input);
    if (url.includes("recipient-options/roles")) {
      return jsonResponse({
        value: [
          { roleId: "role-farmer", roleName: "farmer" },
          { roleId: "role-researcher", roleName: "researcher" },
        ],
      });
    }
    return jsonResponse({
      value: [
        { userId: "user-somchai", username: "somchai", roles: ["farmer"] },
      ],
    });
  });
}

function Harness({
  initial = [],
  active,
  onChange,
}: {
  initial?: ReminderRecipient[];
  active?: boolean;
  onChange?: (next: ReminderRecipient[]) => void;
}) {
  const [recipients, setRecipients] = useState<ReminderRecipient[]>(initial);
  onChange?.(recipients);
  return (
    <RecipientPicker
      recipients={recipients}
      onChange={setRecipients}
      active={active}
    />
  );
}

describe("RecipientPicker", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("loads the roles and the people to pick from", async () => {
    stubOptions();
    render(<Harness />);

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    const urls = vi.mocked(fetch).mock.calls.map(([input]) => String(input));
    expect(urls.some((u) => u.includes("recipient-options/roles"))).toBe(true);
    expect(urls.some((u) => u.includes("recipient-options/users"))).toBe(true);
  });

  it("does not call the backend while it is switched off", async () => {
    stubOptions();
    render(<Harness active={false} />);

    // Past the user search debounce.
    await new Promise((resolve) => setTimeout(resolve, 400));

    expect(fetch).not.toHaveBeenCalled();
  });

  it("picks a whole role", async () => {
    stubOptions();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await userEvent.click(screen.getByLabelText("Roles (e.g. farmer)"));
    await userEvent.click(
      await screen.findByRole("option", { name: "farmer" }),
    );

    expect(onChange).toHaveBeenLastCalledWith([
      { type: "ROLE", id: "role-farmer", label: "farmer" },
    ]);
  });

  it("picks an individual person and keeps any role already chosen", async () => {
    stubOptions();
    const onChange = vi.fn();
    render(
      <Harness
        initial={[{ type: "ROLE", id: "role-farmer", label: "farmer" }]}
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByLabelText("Individual people (search)"));
    await userEvent.click(
      await screen.findByRole("option", { name: "somchai" }),
    );

    expect(onChange).toHaveBeenLastCalledWith([
      { type: "ROLE", id: "role-farmer", label: "farmer" },
      { type: "USER", id: "user-somchai", label: "somchai" },
    ]);
  });

  it("shows the recipients it was given as chips", () => {
    stubOptions();
    render(
      <Harness
        initial={[
          { type: "ROLE", id: "role-farmer", label: "farmer" },
          { type: "USER", id: "user-somchai", label: "somchai" },
        ]}
      />,
    );

    expect(screen.getByText("farmer")).toBeInTheDocument();
    expect(screen.getByText("somchai")).toBeInTheDocument();
  });
});
