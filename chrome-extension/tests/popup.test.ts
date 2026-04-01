// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";

const mockQuery = vi.fn();
vi.stubGlobal("chrome", {
  tabs: { query: mockQuery },
});

describe("popup", () => {
  let exportBtn: HTMLButtonElement;
  let statusDiv: HTMLDivElement;

  beforeEach(() => {
    document.body.innerHTML = `
      <button id="export-btn" disabled>Export as Markdown</button>
      <div id="status" class="status-idle"></div>
    `;
    exportBtn = document.getElementById(
      "export-btn",
    ) as HTMLButtonElement;
    statusDiv = document.getElementById("status") as HTMLDivElement;
    vi.resetModules();
    mockQuery.mockReset();
  });

  async function loadPopup(
    tabs: Array<{ url?: string }>,
  ): Promise<void> {
    mockQuery.mockResolvedValue(tabs);
    vi.stubGlobal("chrome", {
      tabs: { query: mockQuery },
    });
    await import("../src/popup");
    await new Promise((r) => setTimeout(r, 0));
  }

  it("disables button on non-Confluence page", async () => {
    await loadPopup([{ url: "https://google.com" }]);

    expect(exportBtn.disabled).toBe(true);
    expect(statusDiv.textContent).toBe("Not a Confluence page");
    expect(statusDiv.classList.contains("status-disabled")).toBe(
      true,
    );
  });

  it("disables button when no active tab", async () => {
    await loadPopup([]);

    expect(exportBtn.disabled).toBe(true);
    expect(statusDiv.textContent).toBe("Not a Confluence page");
  });

  it("enables button on Confluence page", async () => {
    await loadPopup([
      {
        url: "https://myteam.atlassian.net/wiki/spaces/ENG/pages/456/Test",
      },
    ]);

    expect(exportBtn.disabled).toBe(false);
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
    expect(statusDiv.classList.contains("status-loading")).toBe(
      true,
    );
    expect(statusDiv.querySelector(".spinner")).not.toBeNull();
    expect(statusDiv.textContent).toContain("Exporting");
  });
});
