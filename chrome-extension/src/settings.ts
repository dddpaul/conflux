import { ExtensionSettings } from "./types";

export const DEFAULT_SETTINGS: ExtensionSettings = {
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  brHandling: "newline",
  macros: {
    panels: true,
    expand: true,
    toc: true,
    status: true,
  },
};

export async function loadSettings(): Promise<ExtensionSettings> {
  const result = await chrome.storage.sync.get("settings");
  if (result.settings) {
    return { ...DEFAULT_SETTINGS, ...result.settings };
  }
  return { ...DEFAULT_SETTINGS };
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  await chrome.storage.sync.set({ settings });
}
