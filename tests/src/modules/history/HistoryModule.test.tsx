import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CustomToast } from "@/components/utility/CustomToast";
import HistoryModule from "@/modules/history/HistoryModule";

// docs-and-plan#231 (US5-1): the farmer's history page. The day list comes a
// page at a time; a day shows its diary when one was generated, else the raw
// answers.

vi.mock("@/components/utility/CustomToast", () => ({
  CustomToast: { error: vi.fn(), success: vi.fn() },
}));

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

// Newest first, like the backend: day 0 is 2026-10-20.
function days(from: number, count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(2026, 9, 20 - from - i));
    return d.toISOString().slice(0, 10);
  });
}

type Backend = {
  // One entry per /api/v1/history request, in order; an Error fails it.
  dayPages: (string[] | Error)[];
  diaries?: Record<string, string>;
  answers?: Record<string, { label: string; rawValue: string }[]>;
};

const calls: string[] = [];

function stubBackend(backend: Backend) {
  const pages = [...backend.dayPages];
  vi.mocked(fetch).mockImplementation(async (input) => {
    const url = String(input);
    calls.push(url);
    if (url.startsWith("/api/v1/history?")) {
      const next = pages.shift() ?? [];
      if (next instanceof Error) return jsonResponse({ error: "down" }, 502);
      return jsonResponse({ value: next });
    }
    const diary = url.match(/^\/api\/v1\/diaries\/(.+)$/);
    if (diary) {
      const text = backend.diaries?.[diary[1]];
      return text
        ? jsonResponse({ value: { diaryText: text } })
        : jsonResponse({ error: "no diary" }, 404);
    }
    const answers = url.match(/^\/api\/v1\/history\/(.+)$/);
    if (answers) {
      const rows = (backend.answers?.[answers[1]] ?? []).map((a, i) => ({
        fieldName: `f${i}`,
        inputType: "VARCHAR",
        ...a,
      }));
      return jsonResponse({ value: rows });
    }
    return jsonResponse({ error: "unexpected" }, 500);
  });
}

const dayButtons = () =>
  screen.queryAllByRole("button", { name: /^\d{4}-\d{2}-\d{2}$/ });

beforeEach(() => {
  calls.length = 0;
  vi.stubGlobal("fetch", vi.fn());
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.mocked(CustomToast.error).mockClear();
});

describe("HistoryModule", () => {
  it("asks for the first page of 50 days and opens the newest one", async () => {
    stubBackend({
      dayPages: [days(0, 3)],
      diaries: { "2026-10-20": "ใส่ปุ๋ยคอก 12.5 กิโลกรัม" },
    });
    render(<HistoryModule />);

    expect(await screen.findByText("ใส่ปุ๋ยคอก 12.5 กิโลกรัม")).toBeTruthy();
    expect(dayButtons().map((b) => b.textContent)).toEqual([
      "2026-10-20",
      "2026-10-19",
      "2026-10-18",
    ]);
    expect(calls[0]).toBe("/api/v1/history?page=0&size=50");
  });

  it("falls back to the raw answers for a day with no diary", async () => {
    stubBackend({
      dayPages: [days(0, 2)],
      answers: { "2026-10-20": [{ label: "น้ำหนัก", rawValue: "12.5" }] },
    });
    render(<HistoryModule />);

    expect(await screen.findByText("น้ำหนัก")).toBeTruthy();
    expect(screen.getByText("12.5")).toBeTruthy();
    expect(screen.queryByText("Diary")).toBeNull();
  });

  it("opens the day the farmer picks", async () => {
    stubBackend({
      dayPages: [days(0, 2)],
      diaries: {
        "2026-10-20": "diary of the 20th",
        "2026-10-19": "diary of the 19th",
      },
    });
    render(<HistoryModule />);
    await screen.findByText("diary of the 20th");

    await userEvent.click(screen.getByRole("button", { name: "2026-10-19" }));

    expect(await screen.findByText("diary of the 19th")).toBeTruthy();
    expect(screen.queryByText("diary of the 20th")).toBeNull();
  });

  it("says so when there are no submissions yet, with no load-more", async () => {
    stubBackend({ dayPages: [[]] });
    render(<HistoryModule />);

    expect(
      await screen.findByText("You have no submissions yet."),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "โหลดเพิ่ม" })).toBeNull();
  });

  it("offers load-more only after a full page", async () => {
    stubBackend({ dayPages: [days(0, 49)] });
    render(<HistoryModule />);

    await waitFor(() => expect(dayButtons()).toHaveLength(49));
    expect(screen.queryByRole("button", { name: "โหลดเพิ่ม" })).toBeNull();
  });

  it("loads the next page after the current one, then stops at a short page", async () => {
    stubBackend({ dayPages: [days(0, 50), days(50, 5)] });
    render(<HistoryModule />);
    await waitFor(() => expect(dayButtons()).toHaveLength(50));

    await userEvent.click(screen.getByRole("button", { name: "โหลดเพิ่ม" }));

    await waitFor(() => expect(dayButtons()).toHaveLength(55));
    expect(dayButtons().at(-1)?.textContent).toBe("2026-08-27");
    expect(calls.filter((c) => c.startsWith("/api/v1/history?"))).toEqual([
      "/api/v1/history?page=0&size=50",
      "/api/v1/history?page=1&size=50",
    ]);
    expect(screen.queryByRole("button", { name: "โหลดเพิ่ม" })).toBeNull();
  });

  it("shows a day only once if a new submission shifted the pages", async () => {
    // A new day landed between the two requests, pushing 2026-09-01 (the
    // last day of page 0) onto page 1 as well.
    stubBackend({ dayPages: [days(0, 50), days(49, 3)] });
    render(<HistoryModule />);
    await waitFor(() => expect(dayButtons()).toHaveLength(50));

    await userEvent.click(screen.getByRole("button", { name: "โหลดเพิ่ม" }));

    await waitFor(() => expect(dayButtons()).toHaveLength(52));
    const labels = dayButtons().map((b) => b.textContent);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("keeps the list and the button when loading more fails, so the farmer can retry", async () => {
    stubBackend({
      dayPages: [days(0, 50), new Error("down"), days(50, 2)],
    });
    render(<HistoryModule />);
    await waitFor(() => expect(dayButtons()).toHaveLength(50));

    await userEvent.click(screen.getByRole("button", { name: "โหลดเพิ่ม" }));

    await waitFor(() =>
      expect(CustomToast.error).toHaveBeenCalledWith(
        "ไม่สามารถโหลดประวัติเพิ่มได้",
      ),
    );
    expect(dayButtons()).toHaveLength(50);

    // Retrying asks for the same page again, not the one after it.
    await userEvent.click(screen.getByRole("button", { name: "โหลดเพิ่ม" }));
    await waitFor(() => expect(dayButtons()).toHaveLength(52));
    expect(calls.filter((c) => c.startsWith("/api/v1/history?")).at(-1)).toBe(
      "/api/v1/history?page=1&size=50",
    );
  });

  it("tells the farmer when the history can't be loaded at all", async () => {
    stubBackend({ dayPages: [new Error("down")] });
    render(<HistoryModule />);

    await waitFor(() =>
      expect(CustomToast.error).toHaveBeenCalledWith(
        "ไม่สามารถโหลดประวัติการบันทึกได้",
      ),
    );
    expect(
      await screen.findByText("You have no submissions yet."),
    ).toBeTruthy();
  });
});
