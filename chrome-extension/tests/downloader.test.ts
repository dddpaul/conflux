import { describe, it, expect } from "vitest";
import { sanitizeTitle, buildFilename } from "../src/downloader";

describe("sanitizeTitle", () => {
  it("removes forward slash", () => {
    expect(sanitizeTitle("path/to/page")).toBe("pathtopage");
  });

  it("removes colon", () => {
    expect(sanitizeTitle("title: subtitle")).toBe("title subtitle");
  });

  it("removes question mark", () => {
    expect(sanitizeTitle("How to do this?")).toBe("How to do this");
  });

  it("removes asterisk", () => {
    expect(sanitizeTitle("important*note")).toBe("importantnote");
  });

  it("removes angle brackets", () => {
    expect(sanitizeTitle("before <tag> after")).toBe("before tag after");
  });

  it("removes pipe", () => {
    expect(sanitizeTitle("option|choice")).toBe("optionchoice");
  });

  it("removes backslash", () => {
    expect(sanitizeTitle("back\\slash")).toBe("backslash");
  });

  it("removes multiple special characters", () => {
    expect(sanitizeTitle("a/b:c?d*e<f>g|h\\i")).toBe("abcdefghi");
  });

  it("collapses multiple spaces into one", () => {
    expect(sanitizeTitle("too   many   spaces")).toBe("too many spaces");
  });

  it("trims leading and trailing whitespace", () => {
    expect(sanitizeTitle("  hello  ")).toBe("hello");
  });

  it("handles empty string", () => {
    expect(sanitizeTitle("")).toBe("");
  });

  it("preserves normal characters", () => {
    expect(sanitizeTitle("My Normal Page Title 123")).toBe(
      "My Normal Page Title 123",
    );
  });
});

describe("buildFilename", () => {
  it("uses spaceKey as prefix when available", () => {
    expect(buildFilename("ENG", "12345", "My Page")).toBe("ENG - My Page.md");
  });

  it("falls back to pageId when spaceKey is empty", () => {
    expect(buildFilename("", "12345", "My Page")).toBe("12345 - My Page.md");
  });

  it("sanitizes special characters in title", () => {
    expect(buildFilename("DEV", "99", "Draft: How to <test>?")).toBe(
      "DEV - Draft How to test.md",
    );
  });
});
