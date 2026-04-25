import { describe, it, expect, vi, afterEach } from "vitest";
import {
  extractAttachmentUrls,
  processImages,
  arrayBufferToBase64,
} from "../src/image-processor";

describe("extractAttachmentUrls", () => {
  it("extracts absolute attachment URLs from img src", () => {
    const html =
      '<img src="https://wiki.example.com/download/attachments/123/image.png?v=1" alt="test">';
    const urls = extractAttachmentUrls(html);
    expect(urls).toEqual([
      "https://wiki.example.com/download/attachments/123/image.png?v=1",
    ]);
  });

  it("extracts relative attachment URLs", () => {
    const html =
      '<img src="/download/attachments/123/diagram.svg" alt="">';
    const urls = extractAttachmentUrls(html);
    expect(urls).toEqual(["/download/attachments/123/diagram.svg"]);
  });

  it("extracts URLs with single quotes", () => {
    const html =
      "<img src='/download/attachments/123/photo.jpg' alt=''>";
    const urls = extractAttachmentUrls(html);
    expect(urls).toEqual(["/download/attachments/123/photo.jpg"]);
  });

  it("skips thumbnail URLs", () => {
    const html =
      '<img src="https://wiki.example.com/download/thumbnails/123/thumb.png" alt="">';
    const urls = extractAttachmentUrls(html);
    expect(urls).toEqual([]);
  });

  it("skips generated preview URLs", () => {
    const url =
      "https://wiki.example.com/download/attachments/123/generated/preview.png";
    const html = `<img src="${url}" alt="">`;
    const urls = extractAttachmentUrls(html);
    expect(urls).toEqual([]);
  });

  it("deduplicates URLs", () => {
    const url =
      "https://wiki.example.com/download/attachments/123/img.png";
    const html = `<img src="${url}" alt=""><img src="${url}" alt="">`;
    const urls = extractAttachmentUrls(html);
    expect(urls).toHaveLength(1);
  });

  it("returns empty array when no attachment URLs", () => {
    const html = '<img src="https://example.com/logo.png" alt="">';
    const urls = extractAttachmentUrls(html);
    expect(urls).toEqual([]);
  });

  it("extracts multiple different URLs", () => {
    const html = `
      <img src="https://wiki.example.com/download/attachments/123/a.png" alt="">
      <img src="https://wiki.example.com/download/attachments/123/b.jpg" alt="">
    `;
    const urls = extractAttachmentUrls(html);
    expect(urls).toHaveLength(2);
  });

  it("returns empty array for HTML with no images", () => {
    const html = "<p>Just text, no images</p>";
    const urls = extractAttachmentUrls(html);
    expect(urls).toEqual([]);
  });

  it("handles URL-encoded filenames", () => {
    const url =
      "https://wiki.example.com/download/attachments/123/%D0%A1%D1%85%D0%B5%D0%BC%D0%B0.png";
    const html = `<img src="${url}" alt="">`;
    const urls = extractAttachmentUrls(html);
    expect(urls).toEqual([url]);
  });
});

describe("arrayBufferToBase64", () => {
  it("converts ArrayBuffer to base64 string", () => {
    const bytes = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
    const result = arrayBufferToBase64(bytes.buffer);
    expect(result).toBe(btoa("Hello"));
  });

  it("handles empty buffer", () => {
    const result = arrayBufferToBase64(new ArrayBuffer(0));
    expect(result).toBe("");
  });

  it("handles binary data", () => {
    const bytes = new Uint8Array([137, 80, 78, 71]); // PNG magic bytes
    const result = arrayBufferToBase64(bytes.buffer);
    expect(result).toBe(btoa(String.fromCharCode(137, 80, 78, 71)));
  });
});

describe("processImages", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("replaces attachment URLs with base64 data URIs", async () => {
    const pngBytes = new Uint8Array([137, 80, 78, 71]);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "image/png" }),
      arrayBuffer: () => Promise.resolve(pngBytes.buffer),
    });

    const url =
      "https://wiki.example.com/download/attachments/123/test.png";
    const html = `<img src="${url}" alt="test">`;
    const result = await processImages(html, "https://wiki.example.com");

    expect(result).toContain("data:image/png;base64,");
    expect(result).not.toContain("/download/attachments/");
    expect(global.fetch).toHaveBeenCalledWith(url, {
      credentials: "include",
    });
  });

  it("resolves relative URLs with baseUrl", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "image/jpeg" }),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(2)),
    });

    const html =
      '<img src="/download/attachments/123/photo.jpg" alt="">';
    await processImages(html, "https://wiki.example.com");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://wiki.example.com/download/attachments/123/photo.jpg",
      { credentials: "include" },
    );
  });

  it("strips trailing slash from baseUrl", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "image/png" }),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1)),
    });

    const html =
      '<img src="/download/attachments/123/img.png" alt="">';
    await processImages(html, "https://wiki.example.com/");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://wiki.example.com/download/attachments/123/img.png",
      { credentials: "include" },
    );
  });

  it("skips non-image content types", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/pdf" }),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(4)),
    });

    const url =
      "https://wiki.example.com/download/attachments/123/doc.pdf";
    const html = `<img src="${url}" alt="">`;
    const result = await processImages(html, "https://wiki.example.com");

    expect(result).toContain(url);
    expect(result).not.toContain("data:");
  });

  it("handles content-type with charset parameter", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({
        "content-type": "image/svg+xml; charset=utf-8",
      }),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(2)),
    });

    const url =
      "https://wiki.example.com/download/attachments/123/diagram.svg";
    const html = `<img src="${url}" alt="">`;
    const result = await processImages(html, "https://wiki.example.com");

    expect(result).toContain("data:image/svg+xml;base64,");
  });

  it("handles fetch failures gracefully", async () => {
    global.fetch = vi
      .fn()
      .mockRejectedValue(new Error("Network error"));

    const url =
      "https://wiki.example.com/download/attachments/123/img.png";
    const html = `<img src="${url}" alt="">`;
    const result = await processImages(html, "https://wiki.example.com");

    expect(result).toContain(url);
  });

  it("handles non-ok responses gracefully", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });

    const url =
      "https://wiki.example.com/download/attachments/123/missing.png";
    const html = `<img src="${url}" alt="">`;
    const result = await processImages(html, "https://wiki.example.com");

    expect(result).toContain(url);
  });

  it("returns original HTML when no attachment URLs", async () => {
    const html = "<p>No images here</p>";
    const result = await processImages(html, "https://wiki.example.com");
    expect(result).toBe(html);
  });

  it("replaces all occurrences of the same URL", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "image/png" }),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(2)),
    });

    const url =
      "https://wiki.example.com/download/attachments/123/icon.png";
    const html = `<img src="${url}" alt=""><img src="${url}" alt="">`;
    const result = await processImages(html, "https://wiki.example.com");

    expect(result).not.toContain("/download/attachments/");
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("handles mix of successful and failed downloads", async () => {
    const pngBytes = new Uint8Array([137, 80, 78, 71]);
    const goodUrl =
      "https://wiki.example.com/download/attachments/123/good.png";
    const badUrl =
      "https://wiki.example.com/download/attachments/123/bad.png";

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === goodUrl) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ "content-type": "image/png" }),
          arrayBuffer: () => Promise.resolve(pngBytes.buffer),
        });
      }
      return Promise.resolve({ ok: false, status: 403 });
    });

    const html = `<img src="${goodUrl}" alt=""><img src="${badUrl}" alt="">`;
    const result = await processImages(html, "https://wiki.example.com");

    expect(result).toContain("data:image/png;base64,");
    expect(result).toContain(badUrl);
    expect(result).not.toContain(goodUrl);
  });
});
