import { describe, it, expect } from "vitest";
import { convertHtmlToMarkdown } from "../src/converter";

describe("convertHtmlToMarkdown", () => {
  it("returns an ExportResult with markdown and filename", () => {
    const result = convertHtmlToMarkdown("<p>hello</p>", "Test Page");
    expect(result).toHaveProperty("markdown");
    expect(result).toHaveProperty("filename");
  });

  it("generates filename from title", () => {
    const result = convertHtmlToMarkdown("<p>hi</p>", "My Page Title");
    expect(result.filename).toBe("my-page-title.md");
  });

  it("prepends title as h1 heading", () => {
    const result = convertHtmlToMarkdown("<p>content</p>", "Page Title");
    expect(result.markdown).toMatch(/^# Page Title\n/);
  });

  describe("basic HTML conversion", () => {
    it("converts headings to atx style", () => {
      const html = "<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3>";
      const result = convertHtmlToMarkdown(html, "Test");
      expect(result.markdown).toContain("# Heading 1");
      expect(result.markdown).toContain("## Heading 2");
      expect(result.markdown).toContain("### Heading 3");
    });

    it("converts unordered lists", () => {
      const html = "<ul><li>Item 1</li><li>Item 2</li></ul>";
      const result = convertHtmlToMarkdown(html, "Test");
      expect(result.markdown).toMatch(/-\s+Item 1/);
      expect(result.markdown).toMatch(/-\s+Item 2/);
    });

    it("converts ordered lists", () => {
      const html = "<ol><li>First</li><li>Second</li></ol>";
      const result = convertHtmlToMarkdown(html, "Test");
      expect(result.markdown).toMatch(/1\.\s+First/);
      expect(result.markdown).toMatch(/2\.\s+Second/);
    });

    it("converts links", () => {
      const html = '<a href="https://example.com">Click here</a>';
      const result = convertHtmlToMarkdown(html, "Test");
      expect(result.markdown).toContain("[Click here](https://example.com)");
    });

    it("converts bold and italic", () => {
      const html = "<p><strong>bold</strong> and <em>italic</em></p>";
      const result = convertHtmlToMarkdown(html, "Test");
      expect(result.markdown).toContain("**bold**");
      expect(result.markdown).toContain("_italic_");
    });

    it("handles br elements as line breaks", () => {
      const html = "<p>Line 1<br>Line 2</p>";
      const result = convertHtmlToMarkdown(html, "Test");
      expect(result.markdown).toContain("Line 1");
      expect(result.markdown).toContain("Line 2");
    });
  });

  describe("tables via GFM plugin", () => {
    it("converts HTML tables to GFM tables", () => {
      const html = `
        <table>
          <thead><tr><th>Name</th><th>Value</th></tr></thead>
          <tbody><tr><td>foo</td><td>bar</td></tr></tbody>
        </table>`;
      const result = convertHtmlToMarkdown(html, "Test");
      expect(result.markdown).toContain("| Name | Value |");
      expect(result.markdown).toContain("| --- | --- |");
      expect(result.markdown).toContain("| foo | bar |");
    });
  });

  describe("Confluence code blocks", () => {
    it("converts pre with language class to fenced code block", () => {
      const html = '<pre class="java">public class Foo {}</pre>';
      const result = convertHtmlToMarkdown(html, "Test");
      expect(result.markdown).toContain("```java\npublic class Foo {}\n```");
    });

    it("converts pre with brush: prefix class", () => {
      const html =
        '<pre class="brush: python">def hello():\n    pass</pre>';
      const result = convertHtmlToMarkdown(html, "Test");
      expect(result.markdown).toContain(
        "```python\ndef hello():\n    pass\n```"
      );
    });

    it("converts pre with language- prefix class", () => {
      const html =
        '<pre class="language-javascript">const x = 1;</pre>';
      const result = convertHtmlToMarkdown(html, "Test");
      expect(result.markdown).toContain("```javascript\nconst x = 1;\n```");
    });

    it("handles pre with brush and extra params", () => {
      const html =
        '<pre class="brush: sql; gutter: true">SELECT * FROM t;</pre>';
      const result = convertHtmlToMarkdown(html, "Test");
      expect(result.markdown).toContain("```sql\nSELECT * FROM t;\n```");
    });

    it("converts plain pre to fenced code block", () => {
      const html = "<pre>plain code</pre>";
      const result = convertHtmlToMarkdown(html, "Test");
      expect(result.markdown).toContain("```\nplain code\n```");
    });
  });

  describe("images", () => {
    it("preserves image URLs", () => {
      const html =
        '<img src="https://confluence.example.com/image.png" alt="diagram">';
      const result = convertHtmlToMarkdown(html, "Test");
      expect(result.markdown).toContain(
        "![diagram](https://confluence.example.com/image.png)"
      );
    });
  });

  describe("whitespace normalization", () => {
    it("collapses multiple blank lines", () => {
      const html = "<p>A</p><p></p><p></p><p></p><p>B</p>";
      const result = convertHtmlToMarkdown(html, "Test");
      expect(result.markdown).not.toMatch(/\n{4,}/);
    });

    it("trims trailing whitespace and ends with newline", () => {
      const html = "<p>content</p>";
      const result = convertHtmlToMarkdown(html, "Test");
      expect(result.markdown).toMatch(/\n$/);
      expect(result.markdown).not.toMatch(/\n\n$/);
    });
  });

  describe("options", () => {
    it("respects custom bullet list marker", () => {
      const html = "<ul><li>Item</li></ul>";
      const result = convertHtmlToMarkdown(html, "Test", {
        bulletListMarker: "*",
      });
      expect(result.markdown).toMatch(/\*\s+Item/);
    });
  });
});
