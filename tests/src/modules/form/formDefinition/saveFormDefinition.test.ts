import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  FormSaveError,
  saveFormDefinition,
} from "@/modules/form/formDefinition/saveFormDefinition";

describe("saveFormDefinition", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the response when the save succeeds", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ value: {} }), { status: 201 }),
    );

    const response = await saveFormDefinition("/api/v1/forms", "POST", {});

    expect(response.status).toBe(201);
  });

  it("keeps every line of Kotlin's rejection, one message per problem", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          error:
            "ตาราง agriculture.farm_activity บังคับฟิลด์ farm_id แต่ฟอร์มยังไม่มีคำถามสำหรับฟิลด์นี้\nฟิลด์ plot_id ถูกใช้ซ้ำ 2 คำถาม",
        }),
        { status: 400 },
      ),
    );

    const error = await saveFormDefinition("/api/v1/forms", "POST", {}).catch(
      (e) => e,
    );

    expect(error).toBeInstanceOf(FormSaveError);
    expect(error.messages).toHaveLength(2);
    expect(error.messages[0]).toContain("farm_id");
  });

  it("falls back to the status when the body isn't JSON", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response("gateway down", { status: 502, statusText: "Bad Gateway" }),
    );

    const error = await saveFormDefinition("/api/v1/forms/1", "PUT", {}).catch(
      (e) => e,
    );

    expect(error.messages).toEqual(["Error: 502, Bad Gateway"]);
  });
});
