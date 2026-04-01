// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { copyToClipboard } from "../src/clipboard";

describe("copyToClipboard", () => {
  it("calls navigator.clipboard.writeText with the text", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    await copyToClipboard("# Hello World");

    expect(writeText).toHaveBeenCalledWith("# Hello World");
  });

  it("propagates clipboard errors", async () => {
    const writeText = vi
      .fn()
      .mockRejectedValue(new Error("Clipboard blocked"));
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    await expect(copyToClipboard("text")).rejects.toThrow(
      "Clipboard blocked",
    );
  });
});
