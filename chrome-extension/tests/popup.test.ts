// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";

const mockQuery = vi.fn();
const mockContains = vi.fn();
const mockRequest = vi.fn();
vi.stubGlobal("chrome", {
  tabs: { query: mockQuery },
  permissions: { contains: mockContains, request: mockRequest },
});

describe("popup", () => {
  let exportBtn: HTMLButtonElement;
  let copyBtn: HTMLButtonElement;
  let statusDiv: HTMLDivElement;

  beforeEach(() => {
    document.body.innerHTML = `
      <button id="export-btn" disabled>Export</button>
      <button id="copy-btn" disabled>Copy</button>
      <div id="status" class="status-idle"></div>
    `;
    exportBtn = document.getElementById(
      "export-btn",
    ) as HTMLButtonElement;
    copyBtn = document.getElementById(
      "copy-btn",
    ) as HTMLButtonElement;
    statusDiv = document.getElementById("status") as HTMLDivElement;
    vi.resetModules();
    mockQuery.mockReset();
    mockContains.mockReset();
    mockRequest.mockReset();
  });

  async function loadPopup(
    tabs: Array<{ url?: string }>,
  ): Promise<void> {
    mockQuery.mockResolvedValue(tabs);
    vi.stubGlobal("chrome", {
      tabs: { query: mockQuery },
      permissions: { contains: mockContains, request: mockRequest },
    });
    await import("../src/popup");
    await new Promise((r) => setTimeout(r, 0));
  }

  it("disables both buttons on non-Confluence page", async () => {
    await loadPopup([{ url: "https://google.com" }]);

    expect(exportBtn.disabled).toBe(true);
    expect(copyBtn.disabled).toBe(true);
    expect(statusDiv.textContent).toBe("Not a Confluence page");
    expect(statusDiv.classList.contains("status-disabled")).toBe(
      true,
    );
  });

  it("disables both buttons when no active tab", async () => {
    await loadPopup([]);

    expect(exportBtn.disabled).toBe(true);
    expect(copyBtn.disabled).toBe(true);
    expect(statusDiv.textContent).toBe("Not a Confluence page");
  });

  it("enables both buttons on Confluence page", async () => {
    await loadPopup([
      {
        url: "https://myteam.atlassian.net/wiki/spaces/ENG/pages/456/Test",
      },
    ]);

    expect(exportBtn.disabled).toBe(false);
    expect(copyBtn.disabled).toBe(false);
    expect(statusDiv.textContent).toBe("");
    expect(statusDiv.classList.contains("status-idle")).toBe(true);
  });

  it("shows loading state when export clicked", async () => {
    await loadPopup([
      {
        url: "https://myteam.atlassian.net/wiki/spaces/ENG/pages/456/Test",
      },
    ]);

    exportBtn.click();

    expect(exportBtn.disabled).toBe(true);
    expect(copyBtn.disabled).toBe(true);
    expect(statusDiv.classList.contains("status-loading")).toBe(
      true,
    );
    expect(statusDiv.querySelector(".spinner")).not.toBeNull();
    expect(statusDiv.textContent).toContain("Exporting");
  });

  it("shows loading state when copy clicked", async () => {
    await loadPopup([
      {
        url: "https://myteam.atlassian.net/wiki/spaces/ENG/pages/456/Test",
      },
    ]);

    copyBtn.click();

    expect(exportBtn.disabled).toBe(true);
    expect(copyBtn.disabled).toBe(true);
    expect(statusDiv.classList.contains("status-loading")).toBe(
      true,
    );
  });

  it("shows done state with filename", async () => {
    await loadPopup([
      {
        url: "https://myteam.atlassian.net/wiki/spaces/ENG/pages/456/Test",
      },
    ]);

    const { render } = await import("../src/popup");
    render({ kind: "done", filename: "Getting-Started.md" });

    expect(exportBtn.disabled).toBe(false);
    expect(copyBtn.disabled).toBe(false);
    expect(statusDiv.classList.contains("status-done")).toBe(true);
    expect(statusDiv.textContent).toBe(
      "Saved: Getting-Started.md",
    );
  });

  it("shows copied state", async () => {
    await loadPopup([
      {
        url: "https://myteam.atlassian.net/wiki/spaces/ENG/pages/456/Test",
      },
    ]);

    const { render } = await import("../src/popup");
    render({ kind: "copied" });

    expect(exportBtn.disabled).toBe(false);
    expect(copyBtn.disabled).toBe(false);
    expect(statusDiv.classList.contains("status-copied")).toBe(true);
    expect(statusDiv.textContent).toBe("Copied!");
  });

  it("shows copied confirmation then reverts to idle after 2s", async () => {
    await loadPopup([
      {
        url: "https://myteam.atlassian.net/wiki/spaces/ENG/pages/456/Test",
      },
    ]);

    vi.useFakeTimers();
    const { showCopiedConfirmation } = await import("../src/popup");
    showCopiedConfirmation();

    expect(statusDiv.textContent).toBe("Copied!");
    expect(statusDiv.classList.contains("status-copied")).toBe(true);

    vi.advanceTimersByTime(2000);

    expect(statusDiv.textContent).toBe("");
    expect(statusDiv.classList.contains("status-idle")).toBe(true);
    vi.useRealTimers();
  });

  it("shows error when host permission denied", async () => {
    mockContains.mockResolvedValue(false);
    mockRequest.mockResolvedValue(false);

    await loadPopup([
      {
        url: "https://myteam.atlassian.net/wiki/spaces/ENG/pages/456/Test",
      },
    ]);

    exportBtn.click();
    await new Promise((r) => setTimeout(r, 0));

    expect(exportBtn.disabled).toBe(false);
    expect(statusDiv.classList.contains("status-error")).toBe(true);
    expect(statusDiv.textContent).toBe("Host permission denied");
  });

  it("shows error when copy permission denied", async () => {
    mockContains.mockResolvedValue(false);
    mockRequest.mockResolvedValue(false);

    await loadPopup([
      {
        url: "https://myteam.atlassian.net/wiki/spaces/ENG/pages/456/Test",
      },
    ]);

    copyBtn.click();
    await new Promise((r) => setTimeout(r, 0));

    expect(copyBtn.disabled).toBe(false);
    expect(statusDiv.classList.contains("status-error")).toBe(true);
    expect(statusDiv.textContent).toBe("Host permission denied");
  });

  it("proceeds when host permission granted", async () => {
    mockContains.mockResolvedValue(true);

    await loadPopup([
      {
        url: "https://myteam.atlassian.net/wiki/spaces/ENG/pages/456/Test",
      },
    ]);

    exportBtn.click();
    await new Promise((r) => setTimeout(r, 0));

    // After permission granted, button stays disabled (loading state)
    // because export pipeline is not yet wired (TASK-19)
    expect(exportBtn.disabled).toBe(true);
    expect(statusDiv.classList.contains("status-loading")).toBe(true);
  });

  it("shows error state with message", async () => {
    await loadPopup([
      {
        url: "https://myteam.atlassian.net/wiki/spaces/ENG/pages/456/Test",
      },
    ]);

    const { render } = await import("../src/popup");
    render({ kind: "error", message: "Failed to fetch page" });

    expect(exportBtn.disabled).toBe(false);
    expect(statusDiv.classList.contains("status-error")).toBe(true);
    expect(statusDiv.textContent).toBe("Failed to fetch page");
  });
});
