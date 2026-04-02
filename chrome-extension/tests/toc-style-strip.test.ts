import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { convertHtmlToMarkdown } from "../src/converter";

describe("style tag stripping", () => {
  const html = readFileSync(
    join(__dirname, "fixtures/page-with-toc-style.html"),
    "utf-8",
  );
  const result = convertHtmlToMarkdown(html, "Test Page");

  it("does not contain CDATA", () => {
    expect(result.markdown).not.toContain("CDATA");
  });

  it("does not contain rbtoc", () => {
    expect(result.markdown).not.toContain("rbtoc");
  });

  it("does not contain CSS properties", () => {
    expect(result.markdown).not.toContain("padding");
  });

  it("preserves Overview heading", () => {
    expect(result.markdown).toContain("# Overview");
  });

  it("preserves Configuration heading", () => {
    expect(result.markdown).toContain("# Configuration");
  });

  it("removes TOC links", () => {
    expect(result.markdown).not.toContain("section1");
    expect(result.markdown).not.toContain("toc-link");
  });
});
