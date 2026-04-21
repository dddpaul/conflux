// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";

const mockQuery = vi.fn();
const mockContains = vi.fn();
const mockRequest = vi.fn();
const mockSendMessage = vi.fn();
const mockDownload = vi.fn();
const mockStorageGet = vi.fn();
vi.stubGlobal("chrome", {
  tabs: { query: mockQuery },
  permissions: { contains: mockContains, request: mockRequest },
  runtime: { sendMessage: mockSendMessage },
  downloads: { download: mockDownload },
  storage: { sync: { get: mockStorageGet } },
});

const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: { writeText: mockWriteText },
});

const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
const mockRevokeObjectURL = vi.fn();
URL.createObjectURL = mockCreateObjectURL;
URL.revokeObjectURL = mockRevokeObjectURL;

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
    mockSendMessage.mockReset();
    mockDownload.mockReset();
    mockStorageGet.mockReset();
    mockWriteText.mockReset();
    mockCreateObjectURL.mockReset().mockReturnValue("blob:mock-url");
    mockRevokeObjectURL.mockReset();
    mockStorageGet.mockResolvedValue({});
  });

  async function loadPopup(
    tabs: Array<{ url?: string }>,
  ): Promise<void> {
    mockQuery.mockResolvedValue(tabs);
    vi.stubGlobal("chrome", {
      tabs: { query: mockQuery },
      permissions: { contains: mockContains, request: mockRequest },
      runtime: { sendMessage: mockSendMessage },
      downloads: { download: mockDownload },
      storage: { sync: { get: mockStorageGet } },
    });
    await import("../src/popup");
    await new Promise((r) => setTimeout(r, 0));
  }

  const confluenceUrl =
    "https://myteam.atlassian.net/wiki/spaces/ENG/pages/456/Test";

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
    await loadPopup([{ url: confluenceUrl }]);

    expect(exportBtn.disabled).toBe(false);
    expect(copyBtn.disabled).toBe(false);
    expect(statusDiv.textContent).toBe("");
    expect(statusDiv.classList.contains("status-idle")).toBe(true);
  });

  it("shows loading state when export clicked", async () => {
    await loadPopup([{ url: confluenceUrl }]);

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
    await loadPopup([{ url: confluenceUrl }]);

    copyBtn.click();

    expect(exportBtn.disabled).toBe(true);
    expect(copyBtn.disabled).toBe(true);
    expect(statusDiv.classList.contains("status-loading")).toBe(
      true,
    );
  });

  it("shows done state with filename", async () => {
    await loadPopup([{ url: confluenceUrl }]);

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
    await loadPopup([{ url: confluenceUrl }]);

    const { render } = await import("../src/popup");
    render({ kind: "copied" });

    expect(exportBtn.disabled).toBe(false);
    expect(copyBtn.disabled).toBe(false);
    expect(statusDiv.classList.contains("status-copied")).toBe(true);
    expect(statusDiv.textContent).toBe("Copied!");
  });

  it("shows copied confirmation then reverts to idle after 2s", async () => {
    await loadPopup([{ url: confluenceUrl }]);

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

    await loadPopup([{ url: confluenceUrl }]);

    exportBtn.click();
    await new Promise((r) => setTimeout(r, 0));

    expect(exportBtn.disabled).toBe(false);
    expect(statusDiv.classList.contains("status-error")).toBe(true);
    expect(statusDiv.textContent).toBe("Host permission denied");
  });

  it("shows error when copy permission denied", async () => {
    mockContains.mockResolvedValue(false);
    mockRequest.mockResolvedValue(false);

    await loadPopup([{ url: confluenceUrl }]);

    copyBtn.click();
    await new Promise((r) => setTimeout(r, 0));

    expect(copyBtn.disabled).toBe(false);
    expect(statusDiv.classList.contains("status-error")).toBe(true);
    expect(statusDiv.textContent).toBe("Host permission denied");
  });

  it("shows error state with message", async () => {
    await loadPopup([{ url: confluenceUrl }]);

    const { render } = await import("../src/popup");
    render({ kind: "error", message: "Failed to fetch page" });

    expect(exportBtn.disabled).toBe(false);
    expect(statusDiv.classList.contains("status-error")).toBe(true);
    expect(statusDiv.textContent).toBe("Failed to fetch page");
  });

  describe("export pipeline", () => {
    it("downloads markdown file on successful export", async () => {
      mockContains.mockResolvedValue(true);
      mockSendMessage.mockResolvedValue({
        success: true,
        content: {
          title: "My Page",
          html: "<p>Hello world</p>",
          author: "Test Author",
          published: "2025-01-01",
          pageId: "456",
          sourceUrl: "https://myteam.atlassian.net/pages/viewpage.action?pageId=456",
        },
      });
      mockDownload.mockResolvedValue(undefined);

      await loadPopup([{ url: confluenceUrl }]);
      exportBtn.click();
      await new Promise((r) => setTimeout(r, 0));

      expect(mockSendMessage).toHaveBeenCalledWith({
        action: "fetchPage",
        pageInfo: expect.objectContaining({ pageId: "456" }),
      });
      expect(mockDownload).toHaveBeenCalledWith(
        expect.objectContaining({ filename: "My Page.md" }),
      );
      expect(statusDiv.classList.contains("status-done")).toBe(true);
      expect(statusDiv.textContent).toBe("Saved: My Page.md");
    });

    it("shows error when fetch fails", async () => {
      mockContains.mockResolvedValue(true);
      mockSendMessage.mockResolvedValue({
        success: false,
        error: "Page not found",
      });

      await loadPopup([{ url: confluenceUrl }]);
      exportBtn.click();
      await new Promise((r) => setTimeout(r, 0));

      expect(statusDiv.classList.contains("status-error")).toBe(true);
      expect(statusDiv.textContent).toBe("Page not found");
    });

    it("shows error when sendMessage throws", async () => {
      mockContains.mockResolvedValue(true);
      mockSendMessage.mockRejectedValue(
        new Error("Service worker unavailable"),
      );

      await loadPopup([{ url: confluenceUrl }]);
      exportBtn.click();
      await new Promise((r) => setTimeout(r, 0));

      expect(statusDiv.classList.contains("status-error")).toBe(true);
      expect(statusDiv.textContent).toBe(
        "Service worker unavailable",
      );
    });

    it("shows error when download fails", async () => {
      mockContains.mockResolvedValue(true);
      mockSendMessage.mockResolvedValue({
        success: true,
        content: {
          title: "Page",
          html: "<p>text</p>",
          author: "",
          published: "",
          pageId: "456",
          sourceUrl: "https://myteam.atlassian.net/pages/viewpage.action?pageId=456",
        },
      });
      mockDownload.mockRejectedValue(new Error("Download blocked"));

      await loadPopup([{ url: confluenceUrl }]);
      exportBtn.click();
      await new Promise((r) => setTimeout(r, 0));

      expect(statusDiv.classList.contains("status-error")).toBe(true);
      expect(statusDiv.textContent).toBe("Download blocked");
    });

    it("loads settings and passes to converter", async () => {
      mockContains.mockResolvedValue(true);
      mockSendMessage.mockResolvedValue({
        success: true,
        content: {
          title: "Page",
          html: "<p>text</p>",
          author: "",
          published: "",
          pageId: "456",
          sourceUrl: "https://myteam.atlassian.net/pages/viewpage.action?pageId=456",
        },
      });
      mockDownload.mockResolvedValue(undefined);
      mockStorageGet.mockResolvedValue({
        settings: { headingStyle: "setext" },
      });

      await loadPopup([{ url: confluenceUrl }]);
      exportBtn.click();
      await new Promise((r) => setTimeout(r, 0));

      expect(mockStorageGet).toHaveBeenCalledWith("settings");
      expect(statusDiv.classList.contains("status-done")).toBe(true);
    });
  });

  describe("copy pipeline", () => {
    it("copies markdown to clipboard on successful copy", async () => {
      mockContains.mockResolvedValue(true);
      mockSendMessage.mockResolvedValue({
        success: true,
        content: {
          title: "My Page",
          html: "<p>Hello world</p>",
          author: "Test Author",
          published: "2025-01-01",
          pageId: "456",
          sourceUrl: "https://myteam.atlassian.net/pages/viewpage.action?pageId=456",
        },
      });
      mockWriteText.mockResolvedValue(undefined);

      await loadPopup([{ url: confluenceUrl }]);
      copyBtn.click();
      await new Promise((r) => setTimeout(r, 0));

      expect(mockSendMessage).toHaveBeenCalledWith({
        action: "fetchPage",
        pageInfo: expect.objectContaining({ pageId: "456" }),
      });
      expect(mockWriteText).toHaveBeenCalledWith(
        expect.stringContaining("# My Page"),
      );
      expect(statusDiv.classList.contains("status-copied")).toBe(
        true,
      );
      expect(statusDiv.textContent).toBe("Copied!");
    });

    it("shows error when fetch fails during copy", async () => {
      mockContains.mockResolvedValue(true);
      mockSendMessage.mockResolvedValue({
        success: false,
        error: "Authentication required",
      });

      await loadPopup([{ url: confluenceUrl }]);
      copyBtn.click();
      await new Promise((r) => setTimeout(r, 0));

      expect(statusDiv.classList.contains("status-error")).toBe(true);
      expect(statusDiv.textContent).toBe(
        "Authentication required",
      );
    });

    it("shows error when clipboard write fails", async () => {
      mockContains.mockResolvedValue(true);
      mockSendMessage.mockResolvedValue({
        success: true,
        content: {
          title: "Page",
          html: "<p>text</p>",
          author: "",
          published: "",
          pageId: "456",
          sourceUrl: "https://myteam.atlassian.net/pages/viewpage.action?pageId=456",
        },
      });
      mockWriteText.mockRejectedValue(
        new Error("Clipboard access denied"),
      );

      await loadPopup([{ url: confluenceUrl }]);
      copyBtn.click();
      await new Promise((r) => setTimeout(r, 0));

      expect(statusDiv.classList.contains("status-error")).toBe(true);
      expect(statusDiv.textContent).toBe(
        "Clipboard access denied",
      );
    });
  });
});
