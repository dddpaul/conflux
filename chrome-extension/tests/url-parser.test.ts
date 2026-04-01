import { describe, it, expect } from "vitest";
import { parseConfluenceUrl } from "../src/url-parser";

describe("parseConfluenceUrl", () => {
  describe("Server/DC viewpage.action format", () => {
    it("extracts pageId from viewpage.action URL", () => {
      const result = parseConfluenceUrl(
        "https://confluence.example.com/pages/viewpage.action?pageId=12345"
      );
      expect(result).toEqual({
        baseUrl: "https://confluence.example.com",
        spaceKey: "",
        pageId: "12345",
        pageTitle: "",
      });
    });

    it("extracts spaceKey and title when present", () => {
      const result = parseConfluenceUrl(
        "https://wiki.corp.com/pages/viewpage.action?pageId=999&spaceKey=DEV&title=My+Page"
      );
      expect(result).toEqual({
        baseUrl: "https://wiki.corp.com",
        spaceKey: "DEV",
        pageId: "999",
        pageTitle: "My Page",
      });
    });

    it("returns null when pageId is missing", () => {
      const result = parseConfluenceUrl(
        "https://confluence.example.com/pages/viewpage.action?spaceKey=DEV"
      );
      expect(result).toBeNull();
    });

    it("returns null when pageId is not numeric", () => {
      const result = parseConfluenceUrl(
        "https://confluence.example.com/pages/viewpage.action?pageId=abc"
      );
      expect(result).toBeNull();
    });
  });

  describe("Cloud format", () => {
    it("extracts spaceKey and pageId from Cloud URL", () => {
      const result = parseConfluenceUrl(
        "https://myteam.atlassian.net/wiki/spaces/ENG/pages/456/Getting+Started"
      );
      expect(result).toEqual({
        baseUrl: "https://myteam.atlassian.net",
        spaceKey: "ENG",
        pageId: "456",
        pageTitle: "Getting Started",
      });
    });

    it("handles Cloud URL without title segment", () => {
      const result = parseConfluenceUrl(
        "https://myteam.atlassian.net/wiki/spaces/TEAM/pages/789"
      );
      expect(result).toEqual({
        baseUrl: "https://myteam.atlassian.net",
        spaceKey: "TEAM",
        pageId: "789",
        pageTitle: "",
      });
    });

    it("handles encoded characters in Cloud URL title", () => {
      const result = parseConfluenceUrl(
        "https://company.atlassian.net/wiki/spaces/DOC/pages/101/API%20Reference"
      );
      expect(result).toEqual({
        baseUrl: "https://company.atlassian.net",
        spaceKey: "DOC",
        pageId: "101",
        pageTitle: "API Reference",
      });
    });
  });

  describe("non-Confluence URLs", () => {
    it("returns null for a generic URL", () => {
      expect(parseConfluenceUrl("https://google.com")).toBeNull();
    });

    it("returns null for an invalid URL", () => {
      expect(parseConfluenceUrl("not-a-url")).toBeNull();
    });

    it("returns null for an empty string", () => {
      expect(parseConfluenceUrl("")).toBeNull();
    });

    it("returns null for a Confluence-like URL missing key parts", () => {
      expect(
        parseConfluenceUrl("https://confluence.example.com/wiki/spaces/ENG")
      ).toBeNull();
    });
  });
});
