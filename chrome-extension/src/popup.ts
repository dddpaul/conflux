import { parseConfluenceUrl } from "./url-parser";
import { ConfluencePageInfo } from "./types";

type PopupState =
  | { kind: "idle"; pageInfo: ConfluencePageInfo }
  | { kind: "loading" }
  | { kind: "done"; filename: string }
  | { kind: "error"; message: string }
  | { kind: "disabled"; message: string };

const exportBtn = document.getElementById(
  "export-btn",
) as HTMLButtonElement | null;
const statusDiv = document.getElementById("status");

function render(state: PopupState): void {
  if (!exportBtn || !statusDiv) return;

  statusDiv.className = "";

  switch (state.kind) {
    case "idle":
      exportBtn.disabled = false;
      statusDiv.classList.add("status-idle");
      statusDiv.textContent = "";
      break;

    case "loading":
      exportBtn.disabled = true;
      statusDiv.classList.add("status-loading");
      statusDiv.innerHTML =
        '<span class="spinner"></span> Exporting…';
      break;

    case "done":
      exportBtn.disabled = false;
      statusDiv.classList.add("status-done");
      statusDiv.textContent = `Saved: ${state.filename}`;
      break;

    case "error":
      exportBtn.disabled = false;
      statusDiv.classList.add("status-error");
      statusDiv.textContent = state.message;
      break;

    case "disabled":
      exportBtn.disabled = true;
      statusDiv.classList.add("status-disabled");
      statusDiv.textContent = state.message;
      break;
  }
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

  render({ kind: "idle", pageInfo });

  exportBtn?.addEventListener("click", () => {
    render({ kind: "loading" });
    // Export pipeline will be wired in TASK-19
  });
}

init();
