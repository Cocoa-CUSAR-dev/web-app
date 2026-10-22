import { randomUUID } from "node:crypto";

import { expect, type Page,test } from "@playwright/test";

// docs-and-plan#231 (US5-1): a farmer's own submission history, end to end in
// a real browser against the mock backend (tests/mocks), which serves one
// farmer 55 days of submissions -- more than one page of 50 -- with a diary on
// every third day and raw answers on the rest.
//
// The farmer arrives the way they really do, through the SSO deep link from
// their LINE diary card (see test6sso.spec.ts).

test.skip(
  !!process.env.BASE_URL || !!process.env.BACKEND_URL,
  "needs the mock backend: it serves the farmer and their history",
);

async function signInAsFarmer(page: Page) {
  await page.goto(`/sso#token=farmer-${randomUUID()}`);
  await page.waitForURL(/\/history$/);
}

const dayButton = (page: Page, date: string) =>
  page.getByRole("button", { name: date, exact: true });
const dayButtons = (page: Page) =>
  page.getByRole("button", { name: /^\d{4}-\d{2}-\d{2}$/ });

test.describe("History", () => {
  test("lists the newest 50 days and opens the newest one", async ({
    page,
  }) => {
    await signInAsFarmer(page);

    await expect(page.getByRole("heading", { name: "History" })).toBeVisible();
    await expect(dayButtons(page)).toHaveCount(50);
    await expect(dayButtons(page).first()).toHaveText("2026-10-20");
    await expect(dayButtons(page).last()).toHaveText("2026-09-01");

    // The newest day is open, and it has a generated diary.
    await expect(dayButton(page, "2026-10-20")).toHaveClass(/Mui-selected/);
    await expect(page.getByRole("heading", { name: "Diary" })).toBeVisible();
    await expect(
      page.getByText("วันที่ 2026-10-20 ใส่ปุ๋ยคอก 12.5 กิโลกรัม"),
    ).toBeVisible();
  });

  test("a day without a diary shows the raw answers instead, paged", async ({
    page,
  }) => {
    await signInAsFarmer(page);

    await dayButton(page, "2026-10-19").click();

    await expect(dayButton(page, "2026-10-19")).toHaveClass(/Mui-selected/);
    await expect(page.getByRole("heading", { name: "Diary" })).toHaveCount(0);
    await expect(page.getByText("คำถามที่ 1", { exact: true })).toBeVisible();
    await expect(page.getByText("คำตอบ 1 ของ 2026-10-19")).toBeVisible();
    // 12 answers, 10 a page: the last two are on the next page.
    await expect(page.getByText("คำถามที่ 11", { exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Go to next page" }).click();
    await expect(page.getByText("คำถามที่ 11", { exact: true })).toBeVisible();
    await expect(page.getByText("คำถามที่ 12", { exact: true })).toBeVisible();
  });

  test("switching days swaps the content, diary or answers", async ({
    page,
  }) => {
    await signInAsFarmer(page);

    await dayButton(page, "2026-10-18").click();
    await expect(page.getByText("คำตอบ 1 ของ 2026-10-18")).toBeVisible();

    await dayButton(page, "2026-10-17").click();
    await expect(
      page.getByText("วันที่ 2026-10-17 ใส่ปุ๋ยคอก 12.5 กิโลกรัม"),
    ).toBeVisible();
    await expect(page.getByText("คำตอบ 1 ของ 2026-10-18")).toHaveCount(0);
  });

  test('"โหลดเพิ่ม" loads the older days once, then goes away', async ({
    page,
  }) => {
    await signInAsFarmer(page);
    await expect(dayButtons(page)).toHaveCount(50);

    await page.getByRole("button", { name: "โหลดเพิ่ม" }).click();

    await expect(dayButtons(page)).toHaveCount(55);
    await expect(dayButtons(page).last()).toHaveText("2026-08-27");
    // A short page means that was the oldest day: nothing left to load.
    await expect(page.getByRole("button", { name: "โหลดเพิ่ม" })).toHaveCount(
      0,
    );

    // An older day opens like any other.
    await dayButton(page, "2026-08-27").click();
    await expect(dayButton(page, "2026-08-27")).toHaveClass(/Mui-selected/);
  });

  test("asks the backend one page of days at a time", async ({ page }) => {
    const pages: string[] = [];
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.pathname === "/api/v1/history") pages.push(url.search);
    });

    await signInAsFarmer(page);
    await expect(dayButtons(page)).toHaveCount(50);
    await page.getByRole("button", { name: "โหลดเพิ่ม" }).click();
    await expect(dayButtons(page)).toHaveCount(55);

    expect(pages).toEqual(["?page=0&size=50", "?page=1&size=50"]);
  });
});
