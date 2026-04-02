import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { convertHtmlToMarkdown } from "../src/converter";

const fixtureHtml = readFileSync(
  join(__dirname, "fixtures", "table-with-multiline-cells.html"),
  "utf-8",
);

describe("table with multiline cells", () => {
  const functionNames = [
    "calculateDailyTurnover",
    "validateTransaction",
    "generateReport",
    "reconcileAccounts",
    "applyExchangeRate",
  ];

  describe("structure", () => {
    const result = convertHtmlToMarkdown(fixtureHtml, "Test");

    it("has header row with all column names", () => {
      expect(result.markdown).toMatch(/\|\s*No\s*\|\s*Function\s*\|\s*Description\s*\|/);
    });

    it("has a separator row", () => {
      expect(result.markdown).toMatch(/\|\s*-+\s*\|\s*-+\s*\|\s*-+\s*\|/);
    });

    it("has 5 data rows", () => {
      const lines = result.markdown.split("\n");
      const tableLines = lines.filter((line) => line.startsWith("|"));
      // header + separator + 5 data rows = 7
      const dataRows = tableLines.filter(
        (line) => !line.match(/^\|\s*-/) && !line.match(/No\s*\|/),
      );
      expect(dataRows).toHaveLength(5);
    });

    it("contains all function names", () => {
      for (const name of functionNames) {
        expect(result.markdown).toContain(name);
      }
    });

    it("converts strong tags to bold markdown", () => {
      expect(result.markdown).toContain("**Note:**");
      expect(result.markdown).toContain("**Warning:**");
    });
  });

  describe("brHandling=newline", () => {
    const result = convertHtmlToMarkdown(fixtureHtml, "Test", {
      brHandling: "newline",
    });

    it("produces valid single-line table cells (no literal newlines in rows)", () => {
      const lines = result.markdown.split("\n");
      const tableLines = lines.filter((line) => line.startsWith("|"));
      for (const line of tableLines) {
        // Each table line should be a complete row (starts and ends with |)
        expect(line.trim()).toMatch(/^\|.*\|$/);
      }
    });
  });

  describe("brHandling=remove", () => {
    const result = convertHtmlToMarkdown(fixtureHtml, "Test", {
      brHandling: "remove",
    });

    it("removes br without adding newlines", () => {
      const lines = result.markdown.split("\n");
      const tableLines = lines.filter((line) => line.startsWith("|"));
      for (const line of tableLines) {
        expect(line).not.toContain("<br>");
        expect(line.trim()).toMatch(/^\|.*\|$/);
      }
    });
  });

  describe("brHandling=keep", () => {
    const result = convertHtmlToMarkdown(fixtureHtml, "Test", {
      brHandling: "keep",
    });

    it("preserves literal <br> in cell content", () => {
      const lines = result.markdown.split("\n");
      const tableLines = lines.filter((line) => line.startsWith("|"));
      const hasBr = tableLines.some((line) => line.includes("<br>"));
      expect(hasBr).toBe(true);
    });
  });
});
