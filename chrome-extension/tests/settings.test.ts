import { describe, it, expect, vi, beforeEach } from "vitest";
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "../src/settings";

const mockStorage: Record<string, unknown> = {};

vi.stubGlobal("chrome", {
  storage: {
    sync: {
      get: vi.fn(async (key: string) => {
        return key in mockStorage ? { [key]: mockStorage[key] } : {};
      }),
      set: vi.fn(async (obj: Record<string, unknown>) => {
        Object.assign(mockStorage, obj);
      }),
    },
  },
});

beforeEach(() => {
  for (const key of Object.keys(mockStorage)) {
    delete mockStorage[key];
  }
});

describe("DEFAULT_SETTINGS", () => {
  it("has expected default values", () => {
    expect(DEFAULT_SETTINGS.headingStyle).toBe("atx");
    expect(DEFAULT_SETTINGS.codeBlockStyle).toBe("fenced");
    expect(DEFAULT_SETTINGS.bulletListMarker).toBe("-");
    expect(DEFAULT_SETTINGS.brHandling).toBe("newline");
    expect(DEFAULT_SETTINGS.macros.panels).toBe(true);
    expect(DEFAULT_SETTINGS.macros.expand).toBe(true);
    expect(DEFAULT_SETTINGS.macros.toc).toBe(true);
    expect(DEFAULT_SETTINGS.macros.status).toBe(true);
  });
});

describe("loadSettings", () => {
  it("returns defaults when storage is empty", async () => {
    const settings = await loadSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it("merges saved settings with defaults", async () => {
    mockStorage.settings = { headingStyle: "setext" };
    const settings = await loadSettings();
    expect(settings.headingStyle).toBe("setext");
    expect(settings.bulletListMarker).toBe("-");
  });
});

describe("saveSettings", () => {
  it("stores settings in chrome.storage.sync", async () => {
    const custom = { ...DEFAULT_SETTINGS, headingStyle: "setext" as const };
    await saveSettings(custom);
    expect(mockStorage.settings).toEqual(custom);
  });
});
