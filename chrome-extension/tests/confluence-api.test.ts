import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchPageContent } from "../src/confluence-api";
import { ConfluencePageInfo } from "../src/types";

const mockPageInfo: ConfluencePageInfo = {
  baseUrl: "https://confluence.example.com",
  spaceKey: "DEV",
  pageId: "12345",
  pageTitle: "Test Page",
  originalUrl:
    "https://confluence.example.com/spaces/DEV/pages/12345/Test+Page",
};

function mockFetchResponse(
  body: unknown,
  status = 200,
  ok = true,
): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("fetchPageContent", () => {
  it("fetches page content with correct URL and options", async () => {
    const apiResponse = {
      title: "Test Page",
      body: { export_view: { value: "<p>Hello</p>" } },
    };
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(mockFetchResponse(apiResponse));

    await fetchPageContent(mockPageInfo);

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://confluence.example.com/rest/api/content/12345?expand=body.export_view,history,space",
      {
        credentials: "include",
        headers: { Accept: "application/json" },
      },
    );
  });

  it("returns title and html from API response", async () => {
    const apiResponse = {
      id: "12345",
      title: "My Page Title",
      body: { export_view: { value: "<h1>Content</h1>" } },
      history: {
        createdBy: { displayName: "John Doe" },
        createdDate: "2025-01-15T10:00:00.000Z",
      },
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse(apiResponse),
    );

    const result = await fetchPageContent(mockPageInfo);

    expect(result).toEqual({
      title: "My Page Title",
      html: "<h1>Content</h1>",
      author: "John Doe",
      published: "2025-01-15",
      pageId: "12345",
      spaceKey: "DEV",
      sourceUrl: "https://confluence.example.com/spaces/DEV/pages/12345/Test+Page",
    });
  });

  it("strips trailing slash from baseUrl", async () => {
    const pageInfo = { ...mockPageInfo, baseUrl: "https://wiki.example.com/" };
    const apiResponse = {
      title: "Page",
      body: { export_view: { value: "<p>text</p>" } },
    };
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(mockFetchResponse(apiResponse));

    await fetchPageContent(pageInfo);

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("https://wiki.example.com/rest/api/content/"),
      expect.any(Object),
    );
  });

  it("uses original URL as sourceUrl, not a synthesized one", async () => {
    const apiResponse = {
      id: "42",
      title: "Page",
      body: { export_view: { value: "<p>text</p>" } },
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse(apiResponse),
    );

    const result = await fetchPageContent(mockPageInfo);

    expect(result.sourceUrl).toBe(mockPageInfo.originalUrl);
    expect(result.sourceUrl).not.toContain("viewpage.action");
  });

  it("decodes percent-encoded characters in sourceUrl", async () => {
    const encodedPageInfo: ConfluencePageInfo = {
      ...mockPageInfo,
      originalUrl:
        "https://confluence.example.com/spaces/ARCH/pages/123/%D0%A2%D0%B5%D1%81%D1%82",
    };
    const apiResponse = {
      id: "123",
      title: "Тест",
      body: { export_view: { value: "<p>text</p>" } },
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse(apiResponse),
    );

    const result = await fetchPageContent(encodedPageInfo);

    expect(result.sourceUrl).toBe(
      "https://confluence.example.com/spaces/ARCH/pages/123/Тест",
    );
  });

  it("throws on 401 Unauthorized", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse(null, 401, false),
    );

    await expect(fetchPageContent(mockPageInfo)).rejects.toThrow(
      "Authentication required",
    );
  });

  it("throws on 403 Forbidden", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse(null, 403, false),
    );

    await expect(fetchPageContent(mockPageInfo)).rejects.toThrow(
      "Access denied",
    );
  });

  it("throws on 404 Not Found", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse(null, 404, false),
    );

    await expect(fetchPageContent(mockPageInfo)).rejects.toThrow(
      "Page not found",
    );
  });

  it("throws on 500 Server Error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse(null, 500, false),
    );

    await expect(fetchPageContent(mockPageInfo)).rejects.toThrow(
      "Confluence server error (500)",
    );
  });

  it("throws on 503 Server Error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse(null, 503, false),
    );

    await expect(fetchPageContent(mockPageInfo)).rejects.toThrow(
      "Confluence server error (503)",
    );
  });

  it("throws on unexpected status code", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockFetchResponse(null, 429, false),
    );

    await expect(fetchPageContent(mockPageInfo)).rejects.toThrow(
      "Unexpected error (429)",
    );
  });
});
