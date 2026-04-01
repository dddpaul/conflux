import { parseConfluenceUrl } from "./url-parser";
import { ensureHostPermission } from "./permissions";
import { ConfluencePageInfo } from "./types";

export type PopupState =
  | { kind: "idle"; pageInfo: ConfluencePageInfo }
  | { kind: "loading" }
  | { kind: "done"; filename: string }
  | { kind: "copied" }
  | { kind: "error"; message: string }
  | { kind: "disabled"; message: string };

const exportBtn = document.getElementById(
  "export-btn",
) as HTMLButtonElement | null;
const copyBtn = document.getElementById(
  "copy-btn",
) as HTMLButtonElement | null;
const statusDiv = document.getElementById("status");

export function render(state: PopupState): void {
  if (!exportBtn || !copyBtn || !statusDiv) return;

  statusDiv.className = "";

  switch (state.kind) {
    case "idle":
      exportBtn.disabled = false;
      copyBtn.disabled = false;
      statusDiv.classList.add("status-idle");
      statusDiv.textContent = "";
      break;

    case "loading":
      exportBtn.disabled = true;
      copyBtn.disabled = true;
      statusDiv.classList.add("status-loading");
      statusDiv.innerHTML =
        '<span class="spinner"></span> Exporting…';
      break;

    case "done":
      exportBtn.disabled = false;
      copyBtn.disabled = false;
      statusDiv.classList.add("status-done");
      statusDiv.textContent = `Saved: ${state.filename}`;
      break;

    case "copied":
      exportBtn.disabled = false;
      copyBtn.disabled = false;
      statusDiv.classList.add("status-copied");
      statusDiv.textContent = "Copied!";
      break;

    case "error":
      exportBtn.disabled = false;
      copyBtn.disabled = false;
      statusDiv.classList.add("status-error");
      statusDiv.textContent = state.message;
      break;

    case "disabled":
      exportBtn.disabled = true;
      copyBtn.disabled = true;
      statusDiv.classList.add("status-disabled");
      statusDiv.textContent = state.message;
      break;
  }
}

let copiedTimer: ReturnType<typeof setTimeout> | null = null;
let currentPageInfo: ConfluencePageInfo | null = null;

export function showCopiedConfirmation(): void {
  if (copiedTimer) clearTimeout(copiedTimer);
  render({ kind: "copied" });
  copiedTimer = setTimeout(() => {
    if (currentPageInfo) {
      render({ kind: "idle", pageInfo: currentPageInfo });
    }
  }, 2000);
}

async function getActiveTabUrl(): Promise<string | null> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  return tab?.url ?? null;
}

async function init(): Promise<void> {
  const url = await getActiveTabUrl();
  if (!url) {
    render({ kind: "disabled", message: "Not a Confluence page" });
    return;
  }

  const pageInfo = parseConfluenceUrl(url);
  if (!pageInfo) {
    render({ kind: "disabled", message: "Not a Confluence page" });
    return;
  }

  currentPageInfo = pageInfo;
  render({ kind: "idle", pageInfo });

  exportBtn?.addEventListener("click", async () => {
    render({ kind: "loading" });
    const granted = await ensureHostPermission(url);
    if (!granted) {
      render({
        kind: "error",
        message: "Host permission denied",
      });
      return;
    }
    // Export pipeline will be wired in TASK-19
  });

  copyBtn?.addEventListener("click", async () => {
    render({ kind: "loading" });
    const granted = await ensureHostPermission(url);
    if (!granted) {
      render({
        kind: "error",
        message: "Host permission denied",
      });
      return;
    }
    // Copy pipeline will be wired in TASK-19
    // For now, show copied state placeholder
  });
}

init();
