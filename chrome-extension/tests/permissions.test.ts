import { describe, it, expect, vi, beforeEach } from "vitest";
import { getOriginFromUrl, ensureHostPermission } from "../src/permissions";

const mockContains = vi.fn();
const mockRequest = vi.fn();

vi.stubGlobal("chrome", {
  permissions: {
    contains: mockContains,
    request: mockRequest,
  },
});

describe("getOriginFromUrl", () => {
  it("extracts origin with trailing slash", () => {
    expect(
      getOriginFromUrl(
        "https://myteam.atlassian.net/wiki/spaces/ENG/pages/123",
      ),
    ).toBe("https://myteam.atlassian.net/");
  });

  it("returns null for invalid URL", () => {
    expect(getOriginFromUrl("not-a-url")).toBeNull();
  });

  it("handles different ports", () => {
    expect(
      getOriginFromUrl("https://confluence.example.com:8443/display/SPACE"),
    ).toBe("https://confluence.example.com:8443/");
  });

  it("handles http scheme", () => {
    expect(
      getOriginFromUrl("http://localhost:8090/pages/viewpage.action?pageId=1"),
    ).toBe("http://localhost:8090/");
  });
});

describe("ensureHostPermission", () => {
  beforeEach(() => {
    mockContains.mockReset();
    mockRequest.mockReset();
  });

  it("returns true when permission already granted", async () => {
    mockContains.mockResolvedValue(true);

    const result = await ensureHostPermission(
      "https://myteam.atlassian.net/wiki/spaces/ENG/pages/123",
    );

    expect(result).toBe(true);
    expect(mockContains).toHaveBeenCalledWith({
      origins: ["https://myteam.atlassian.net/"],
    });
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("requests permission when not yet granted", async () => {
    mockContains.mockResolvedValue(false);
    mockRequest.mockResolvedValue(true);

    const result = await ensureHostPermission(
      "https://confluence.example.com/display/SPACE/Page",
    );

    expect(result).toBe(true);
    expect(mockRequest).toHaveBeenCalledWith({
      origins: ["https://confluence.example.com/"],
    });
  });

  it("returns false when user denies permission", async () => {
    mockContains.mockResolvedValue(false);
    mockRequest.mockResolvedValue(false);

    const result = await ensureHostPermission(
      "https://confluence.example.com/display/SPACE/Page",
    );

    expect(result).toBe(false);
  });

  it("returns false for invalid URL", async () => {
    const result = await ensureHostPermission("not-a-url");

    expect(result).toBe(false);
    expect(mockContains).not.toHaveBeenCalled();
  });

  it("works with different Confluence instances", async () => {
    mockContains.mockResolvedValue(false);
    mockRequest.mockResolvedValue(true);

    await ensureHostPermission(
      "https://team-a.atlassian.net/wiki/spaces/DEV/pages/1",
    );
    expect(mockRequest).toHaveBeenCalledWith({
      origins: ["https://team-a.atlassian.net/"],
    });

    mockRequest.mockClear();
    await ensureHostPermission(
      "https://team-b.atlassian.net/wiki/spaces/OPS/pages/2",
    );
    expect(mockRequest).toHaveBeenCalledWith({
      origins: ["https://team-b.atlassian.net/"],
    });
  });
});
