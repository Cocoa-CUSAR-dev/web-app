import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { handleFileResponseXlsx } from "@/libs/handleFileResponse";

function makeResponse({
  ok = true,
  status = 200,
  statusText = "OK",
  contentDisposition,
}: {
  ok?: boolean;
  status?: number;
  statusText?: string;
  contentDisposition?: string | null;
} = {}) {
  return {
    ok,
    status,
    statusText,
    headers: {
      get: (name: string) =>
        name === "Content-Disposition" ? (contentDisposition ?? null) : null,
    },
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
  } as unknown as Response;
}

describe("handleFileResponseXlsx", () => {
  let clickSpy: ReturnType<typeof vi.fn>;
  let createObjectURLSpy: ReturnType<typeof vi.fn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    clickSpy = vi.fn();
    vi.spyOn(document, "createElement").mockImplementation(
      () => ({ click: clickSpy }) as unknown as HTMLAnchorElement,
    );
    createObjectURLSpy = vi.fn().mockReturnValue("blob:mock-url");
    revokeObjectURLSpy = vi.fn();
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: createObjectURLSpy,
      revokeObjectURL: revokeObjectURLSpy,
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("downloads with the filename parsed from Content-Disposition", async () => {
    const anchor = { click: clickSpy } as unknown as HTMLAnchorElement;
    vi.spyOn(document, "createElement").mockReturnValue(anchor);

    await handleFileResponseXlsx(
      makeResponse({
        contentDisposition: 'attachment; filename="report-2024.xlsx"',
      }),
    );

    expect(anchor.download).toBe("report-2024.xlsx");
    expect(anchor.href).toBe("blob:mock-url");
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");
  });

  it("appends .xlsx when the parsed filename is missing the extension", async () => {
    const anchor = { click: clickSpy } as unknown as HTMLAnchorElement;
    vi.spyOn(document, "createElement").mockReturnValue(anchor);

    await handleFileResponseXlsx(
      makeResponse({ contentDisposition: 'attachment; filename="report"' }),
    );

    expect(anchor.download).toBe("report.xlsx");
  });

  it("falls back to a default filename when Content-Disposition is absent", async () => {
    const anchor = { click: clickSpy } as unknown as HTMLAnchorElement;
    vi.spyOn(document, "createElement").mockReturnValue(anchor);

    await handleFileResponseXlsx(makeResponse({ contentDisposition: null }));

    expect(anchor.download).toBe("exam-report.xlsx");
  });

  it("logs and does not throw when the response is not ok", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      handleFileResponseXlsx(
        makeResponse({ ok: false, status: 500, statusText: "Server Error" }),
      ),
    ).resolves.toBeUndefined();

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: "HTTP 500: Server Error" }),
    );
    expect(clickSpy).not.toHaveBeenCalled();
  });
});
