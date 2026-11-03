import { expect, type Page,test } from "@playwright/test";

import { E2E_PASSWORD, E2E_USERNAME } from "./testUtils/e2eCredentials";

// docs-and-plan#174 (US2-8): the researcher's review-and-correct flow, end to
// end in a real browser -- from the form viewer into the review screen,
// spotting what the AI extracted, correcting a value, and seeing it stick.
// Runs against the mock backend (tests/mocks), whose review endpoints keep
// corrections in memory and validate values by question type the way
// web-backend does. Component-level details (dialog validation, card
// layout) are already unit-tested under tests/src/modules/form/.../route-review.

const MOCK_BACKEND = `http://127.0.0.1:${process.env.MOCK_BACKEND_PORT ?? 4310}`;
const usesMockBackend = !process.env.BASE_URL && !process.env.BACKEND_URL;

// Corrections persist in the mock between specs, like the real database.
test.describe.configure({ mode: "serial" });
test.skip(
  !usesMockBackend,
  "needs the mock backend: it resets and inspects review state",
);

async function logIn(page: Page) {
  await page.goto("/");
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Log In" })
    .click();
  await page.getByRole("textbox", { name: "email" }).fill(E2E_USERNAME);
  await page.getByRole("textbox", { name: "password" }).fill(E2E_PASSWORD);
  await page.getByRole("checkbox").click();
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/auth"));
}

// Each submission is a <section> card headed by the submitter's name.
const submission = (page: Page, submitter: string) =>
  page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: submitter }) });

// The innermost row holding both the field's label and its Edit button.
const fieldRow = (card: ReturnType<typeof submission>, label: string) =>
  card
    .locator("div")
    .filter({ hasText: label })
    .filter({ has: card.page().getByRole("button", { name: `Edit ${label}` }) })
    .last();

test.describe("Review & correct", () => {
  test.beforeEach(async ({ page, request }) => {
    await request.post(`${MOCK_BACKEND}/__e2e/review/reset`);
    await logIn(page);
  });

  test("opens from the form viewer and lists every submission field by field", async ({
    page,
  }) => {
    await page.goto("/form/form-viewer/form-1");
    await page.getByRole("button", { name: "Review & correct" }).click();
    await page.waitForURL("**/form/form-viewer/form-1/review");

    await expect(
      page.getByRole("heading", { name: "จดกิจกรรมในสวน" }),
    ).toBeVisible();
    const first = submission(page, "สมชาย ใจดี");
    const second = submission(page, "สมหญิง รักสวน");
    await expect(first).toBeVisible();
    await expect(second).toBeVisible();

    // What the AI pulled out of free text is flagged, apart from answers to
    // direct questions.
    await expect(first.getByText("1 AI-extracted")).toBeVisible();
    await expect(
      fieldRow(first, "น้ำหนักผลผลิต").getByText("AI-extracted", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      fieldRow(first, "จำนวนต้น").getByText("Chatbot", { exact: true }),
    ).toBeVisible();
    await expect(second.getByText(/AI-extracted/)).toHaveCount(0);

    // A field type the backend can't correct yet offers no Edit.
    await expect(
      first.getByRole("button", { name: "Edit รูปแปลง" }),
    ).toBeDisabled();
  });

  test('"AI-extracted only" narrows the list to submissions worth checking', async ({
    page,
  }) => {
    await page.goto("/form/form-viewer/form-1/review");
    await expect(submission(page, "สมหญิง รักสวน")).toBeVisible();

    await page.getByLabel("AI-extracted only").check();

    await expect(submission(page, "สมชาย ใจดี")).toBeVisible();
    await expect(submission(page, "สมหญิง รักสวน")).toHaveCount(0);
  });

  test("corrects an AI-extracted value, and the correction is saved", async ({
    page,
    request,
  }) => {
    await page.goto("/form/form-viewer/form-1/review");
    const card = submission(page, "สมชาย ใจดี");
    await card.getByRole("button", { name: "Edit น้ำหนักผลผลิต" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Correct: น้ำหนักผลผลิต")).toBeVisible();
    await expect(
      dialog.getByText(
        "This value was extracted by AI from the farmer's message.",
      ),
    ).toBeVisible();
    await expect(dialog.getByText("Current value: 120")).toBeVisible();
    // Nothing changed yet: nothing to save.
    await expect(dialog.getByRole("button", { name: "Save" })).toBeDisabled();

    await dialog.getByLabel("New value").fill("12");
    await dialog
      .getByLabel("Reason (optional)")
      .fill("farmer said 12 kg, AI read 120");
    await dialog.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Correction saved")).toBeVisible();
    await expect(dialog).toBeHidden();
    await expect(
      fieldRow(card, "น้ำหนักผลผลิต").getByText("12", { exact: true }),
    ).toBeVisible();

    // Recorded once, with the old value and the reason (the audit trail).
    const corrections = await (
      await request.get(`${MOCK_BACKEND}/__e2e/review/corrections`)
    ).json();
    expect(corrections).toEqual([
      {
        responseId: "resp-1",
        fieldName: "harvest_weight",
        from: "120",
        to: "12",
        reason: "farmer said 12 kg, AI read 120",
      },
    ]);

    // Still there after a reload: it was saved, not just shown.
    await page.reload();
    await expect(
      fieldRow(submission(page, "สมชาย ใจดี"), "น้ำหนักผลผลิต").getByText(
        "12",
        { exact: true },
      ),
    ).toBeVisible();
  });

  test("catches a value of the wrong type before sending it", async ({
    page,
    request,
  }) => {
    await page.goto("/form/form-viewer/form-1/review");
    const card = submission(page, "สมชาย ใจดี");
    await card.getByRole("button", { name: "Edit จำนวนต้น" }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("New value").fill("40.5");

    await expect(dialog.getByText("Must be a whole number")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Save" })).toBeDisabled();
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(
      fieldRow(card, "จำนวนต้น").getByText("40", { exact: true }),
    ).toBeVisible();
    const corrections = await (
      await request.get(`${MOCK_BACKEND}/__e2e/review/corrections`)
    ).json();
    expect(corrections).toEqual([]);
  });

  test("shows the backend's reason when it refuses a value, and changes nothing", async ({
    page,
    request,
  }) => {
    await page.goto("/form/form-viewer/form-1/review");
    const card = submission(page, "สมชาย ใจดี");
    await card.getByRole("button", { name: "Edit น้ำหนักผลผลิต" }).click();

    // A valid number to the screen, but below the question's minimum, which
    // only the backend knows about.
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("New value").fill("-5");
    await dialog.getByRole("button", { name: "Save" }).click();

    await expect(dialog.getByText("Value must be at least 0")).toBeVisible();
    // Still open with the farmer's value intact, so the reviewer can fix it.
    await expect(dialog.getByText("Current value: 120")).toBeVisible();
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(
      fieldRow(card, "น้ำหนักผลผลิต").getByText("120", { exact: true }),
    ).toBeVisible();
    const corrections = await (
      await request.get(`${MOCK_BACKEND}/__e2e/review/corrections`)
    ).json();
    expect(corrections).toEqual([]);
  });

  test("cancelling a correction leaves the value as it was", async ({
    page,
    request,
  }) => {
    await page.goto("/form/form-viewer/form-1/review");
    const card = submission(page, "สมหญิง รักสวน");
    await card.getByRole("button", { name: "Edit น้ำหนักผลผลิต" }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("New value").fill("100");
    await dialog.getByRole("button", { name: "Cancel" }).click();

    await expect(dialog).toBeHidden();
    await expect(
      fieldRow(card, "น้ำหนักผลผลิต").getByText("95.5", { exact: true }),
    ).toBeVisible();
    const corrections = await (
      await request.get(`${MOCK_BACKEND}/__e2e/review/corrections`)
    ).json();
    expect(corrections).toEqual([]);
  });

  test("a researcher without access to the form is told so, not shown an empty list", async ({
    page,
  }) => {
    await page.goto("/form/form-viewer/form-forbidden/review");

    await expect(
      page.getByText(
        "You don't have permission to review this form's submissions.",
      ),
    ).toBeVisible();
    await expect(
      page.getByText("There are no submissions to review yet."),
    ).toHaveCount(0);
  });
});
