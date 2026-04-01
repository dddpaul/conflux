import { describe, it, expect } from "vitest";
import { convertHtmlToMarkdown } from "../src/converter";

describe("convertHtmlToMarkdown", () => {
  it("returns an ExportResult", () => {
    const result = convertHtmlToMarkdown("<p>hello</p>", "Test Page");
    expect(result).toHaveProperty("markdown");
    expect(result).toHaveProperty("filename");
  });
});
