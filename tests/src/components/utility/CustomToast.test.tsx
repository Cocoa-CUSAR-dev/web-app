import { afterEach, describe, expect, it, vi } from "vitest";

import { CustomToast } from "@/components/utility/CustomToast";

const toastFn = vi.fn((..._args: unknown[]) => "generated-toast-id");
const dismissFn = vi.fn((..._args: unknown[]) => {});

vi.mock("react-hot-toast", () => ({
  toast: Object.assign(
    (...args: unknown[]) => toastFn(...args),
    { dismiss: (...args: unknown[]) => dismissFn(...args) },
  ),
}));

describe("CustomToast", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("success() shows an infinite-duration toast by default", () => {
    const id = CustomToast.success("Saved");

    expect(id).toBe("generated-toast-id");
    expect(toastFn).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ duration: Infinity }),
    );
  });

  it("success() lets caller-supplied options override the defaults", () => {
    CustomToast.success("Saved", undefined, { duration: 1000 });

    expect(toastFn).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ duration: 1000 }),
    );
  });

  it("error() and warning() delegate to the same toast() call", () => {
    CustomToast.error("Failed");
    CustomToast.warning("Careful");

    expect(toastFn).toHaveBeenCalledTimes(2);
  });

  it("loading() always forces an infinite duration even if overridden", () => {
    CustomToast.loading("Loading...", undefined, { duration: 500 });

    expect(toastFn).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ duration: Infinity }),
    );
  });

  it("dismiss(id) dismisses a specific toast", () => {
    CustomToast.dismiss("some-id");

    expect(dismissFn).toHaveBeenCalledWith("some-id");
  });

  it("dismiss() with no id dismisses all toasts", () => {
    CustomToast.dismiss();

    expect(dismissFn).toHaveBeenCalledWith();
  });

  describe("promise()", () => {
    it("shows a loading toast, then success with the same id, and resolves with the original value", async () => {
      const result = await CustomToast.promise(Promise.resolve("payload"), {
        loading: "please wait",
        success: "done",
      });

      expect(result).toBe("payload");
      expect(toastFn).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ id: "generated-toast-id" }),
      );
    });

    it("shows an error toast with the same id and rethrows on rejection", async () => {
      const boom = new Error("boom");

      await expect(
        CustomToast.promise(Promise.reject(boom), {
          loading: "please wait",
          error: "failed",
        }),
      ).rejects.toBe(boom);

      expect(toastFn).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ id: "generated-toast-id" }),
      );
    });

    it("reuses a caller-supplied id instead of generating a new one", async () => {
      await CustomToast.promise(
        Promise.resolve("ok"),
        {},
        undefined,
        { id: "my-fixed-id" },
      );

      expect(toastFn).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ id: "my-fixed-id" }),
      );
    });
  });
});
