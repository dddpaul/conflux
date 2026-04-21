// @vitest-environment jsdom
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import type { Server } from "http";
import { parseConfluenceUrl } from "../src/url-parser";
import { fetchPageContent } from "../src/confluence-api";
import { convertHtmlToMarkdown } from "../src/converter";
import { sanitizeTitle, buildFilename } from "../src/downloader";
import type { ConfluencePageInfo, ConfluenceApiResponse } from "../src/types";

// --- Mock Confluence pages with realistic HTML ---

const PAGES: Record<string, ConfluenceApiResponse> = {
  "1001": {
    id: "1001",
    title: "Getting Started Guide",
    body: {
      export_view: {
        value: `
<h2>Introduction</h2>
<p>Welcome to the <strong>Getting Started</strong> guide. This page covers the basics.</p>
<h3>Prerequisites</h3>
<ul>
  <li>Node.js 18+</li>
  <li>npm or yarn</li>
</ul>
<p>Plain paragraph with <em>italic</em> and <a href="https://example.com">a link</a>.</p>
`,
      },
    },
  },
  "1002": {
    id: "1002",
    title: "Data Model Reference",
    body: {
      export_view: {
        value: `
<h2>Schema Overview</h2>
<table>
  <thead>
    <tr><th>Column</th><th>Type</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td>id</td><td>bigint</td><td>Primary key</td></tr>
    <tr><td>name</td><td>varchar(255)</td><td>Display name</td></tr>
    <tr><td>created_at</td><td>timestamp</td><td>Row creation time</td></tr>
  </tbody>
</table>
`,
      },
    },
  },
  "1003": {
    id: "1003",
    title: "API Examples",
    body: {
      export_view: {
        value: `
<h2>Python Client</h2>
<pre class="brush: python">import requests

resp = requests.get("https://api.example.com/v1/users")
print(resp.json())</pre>
<h2>JavaScript Client</h2>
<pre class="language-javascript">const res = await fetch("/api/users");
const data = await res.json();
console.log(data);</pre>
<h2>Plain Code</h2>
<pre>echo "no language specified"</pre>
`,
      },
    },
  },
  "1004": {
    id: "1004",
    title: "Deployment Runbook",
    body: {
      export_view: {
        value: `
<h2>Pre-deploy Checks</h2>
<div class="confluence-information-macro confluence-information-macro-information">
  <div class="confluence-information-macro-body">
    <p>Always run smoke tests before deploying to production.</p>
  </div>
</div>
<div class="confluence-information-macro confluence-information-macro-warning">
  <div class="confluence-information-macro-body">
    <p>Never deploy on Fridays after 3 PM.</p>
  </div>
</div>
<h2>Rollback</h2>
<div class="expand-container">
  <div class="expand-control">
    <span class="expand-control-text">Emergency rollback steps</span>
  </div>
  <div class="expand-content">
    <p>1. Revert the last deployment commit.</p>
    <p>2. Run the deployment pipeline again.</p>
  </div>
</div>
`,
      },
    },
  },
  "1005": {
    id: "1005",
    title: "Team Status & Mentions",
    body: {
      export_view: {
        value: `
<h2>Current Sprint</h2>
<p>Status: <span class="status-macro aui-lozenge aui-lozenge-success">on track</span></p>
<p>Lead: <a class="confluence-userlink" href="/wiki/people/jsmith">Jane Smith</a></p>
<p>Reviewer: <a class="confluence-userlink" href="/wiki/people/bdoe">Bob Doe</a></p>
<div class="toc-macro">Table of contents placeholder</div>
`,
      },
    },
  },
  "1006": {
    id: "1006",
    title: "Page with Special/Characters: in <title> & more*",
    body: {
      export_view: {
        value: `
<h2>Content</h2>
<p>This page has special characters in its title.</p>
`,
      },
    },
  },
};

// --- Express mock server ---

let server: Server;
let port: number;

function createMockServer(): Promise<{ server: Server; port: number }> {
  return new Promise((resolve) => {
    const app = express();

    app.get(
      "/rest/api/content/:pageId",
      (req: express.Request, res: express.Response) => {
        const { pageId } = req.params;
        const expand = req.query.expand as string;

        if (expand !== "body.export_view,history,space") {
          res.status(400).json({ message: "Missing expand parameter" });
          return;
        }

        const page = PAGES[pageId];
        if (!page) {
          res.status(404).json({
            statusCode: 404,
            message: "Page not found",
          });
          return;
        }

        res.json(page);
      },
    );

    const srv = app.listen(0, () => {
      const addr = srv.address();
      const p = typeof addr === "object" && addr ? addr.port : 0;
      resolve({ server: srv, port: p });
    });
  });
}

beforeAll(async () => {
  const result = await createMockServer();
  server = result.server;
  port = result.port;
});

afterAll(
  () =>
    new Promise<void>((resolve) => {
      server.close(() => resolve());
    }),
);

// --- Helper ---

function mockBaseUrl(): string {
  return `http://localhost:${port}`;
}

function pageInfo(pageId: string): ConfluencePageInfo {
  return {
    baseUrl: mockBaseUrl(),
    spaceKey: "TEST",
    pageId,
    pageTitle: "",
  };
}

// --- AC #3: URL parsing for Server/DC and Cloud formats ---

describe("parseConfluenceUrl — URL formats", () => {
  it("parses Server/DC viewpage.action URL", () => {
    const url =
      "https://wiki.corp.com/pages/viewpage.action?pageId=98765&spaceKey=ENG";
    const info = parseConfluenceUrl(url);
    expect(info).not.toBeNull();
    expect(info!.baseUrl).toBe("https://wiki.corp.com");
    expect(info!.pageId).toBe("98765");
    expect(info!.spaceKey).toBe("ENG");
  });

  it("parses Cloud URL with encoded title", () => {
    const url =
      "https://mysite.atlassian.net/wiki/spaces/PROJ/pages/123456/My+Page+Title";
    const info = parseConfluenceUrl(url);
    expect(info).not.toBeNull();
    expect(info!.baseUrl).toBe("https://mysite.atlassian.net");
    expect(info!.pageId).toBe("123456");
    expect(info!.spaceKey).toBe("PROJ");
    expect(info!.pageTitle).toBe("My Page Title");
  });

  it("parses Server/DC display URL", () => {
    const url = "https://confluence.example.com/display/TEAM/Meeting+Notes";
    const info = parseConfluenceUrl(url);
    expect(info).not.toBeNull();
    expect(info!.spaceKey).toBe("TEAM");
    expect(info!.pageTitle).toBe("Meeting Notes");
    expect(info!.pageId).toBe("");
  });

  // AC #7: non-Confluence URL returns null
  it("returns null for non-Confluence URL", () => {
    expect(parseConfluenceUrl("https://google.com")).toBeNull();
  });

  it("returns null for invalid URL", () => {
    expect(parseConfluenceUrl("not-a-url")).toBeNull();
  });

  it("returns null for viewpage.action without pageId", () => {
    expect(
      parseConfluenceUrl(
        "https://wiki.corp.com/pages/viewpage.action?spaceKey=ENG",
      ),
    ).toBeNull();
  });
});

// --- AC #1 & #4: Mock server serves API and fetch returns valid data ---

describe("fetchPageContent — mock Confluence server", () => {
  it("returns title and HTML for a known page", async () => {
    const content = await fetchPageContent(pageInfo("1001"));
    expect(content.title).toBe("Getting Started Guide");
    expect(content.html).toContain("<strong>Getting Started</strong>");
  });

  it("returns table HTML for the data model page", async () => {
    const content = await fetchPageContent(pageInfo("1002"));
    expect(content.title).toBe("Data Model Reference");
    expect(content.html).toContain("<table>");
    expect(content.html).toContain("bigint");
  });

  it("returns code block HTML", async () => {
    const content = await fetchPageContent(pageInfo("1003"));
    expect(content.title).toBe("API Examples");
    expect(content.html).toContain('class="brush: python"');
  });

  it("throws for non-existent page", async () => {
    await expect(fetchPageContent(pageInfo("9999"))).rejects.toThrow(
      "Page not found",
    );
  });
});

// --- AC #5: Converter produces correct markdown ---

describe("end-to-end pipeline: fetch → convert → verify", () => {
  it("converts plain text and headings", async () => {
    const content = await fetchPageContent(pageInfo("1001"));
    const result = convertHtmlToMarkdown(content.html, content.title);

    expect(result.markdown).toMatch(/^# Getting Started Guide\n/);
    expect(result.markdown).toContain("## Introduction");
    expect(result.markdown).toContain("### Prerequisites");
    expect(result.markdown).toMatch(/-\s+Node\.js 18\+/);
    expect(result.markdown).toContain("**Getting Started**");
    expect(result.markdown).toContain("[a link](https://example.com)");
    expect(result.filename).toBe("Getting Started Guide.md");
  });

  it("converts tables to GFM markdown", async () => {
    const content = await fetchPageContent(pageInfo("1002"));
    const result = convertHtmlToMarkdown(content.html, content.title);

    expect(result.markdown).toContain("| Column | Type | Description |");
    expect(result.markdown).toContain("| id | bigint | Primary key |");
    expect(result.markdown).toContain("| name | varchar(255) | Display name |");
    expect(result.markdown).toMatch(/\|[-\s|]+\|/);
  });

  it("converts code blocks with language fences", async () => {
    const content = await fetchPageContent(pageInfo("1003"));
    const result = convertHtmlToMarkdown(content.html, content.title);

    expect(result.markdown).toContain("```python\n");
    expect(result.markdown).toContain("import requests");
    expect(result.markdown).toContain("```javascript\n");
    expect(result.markdown).toContain("const res = await fetch");
    // Plain pre block — no language
    expect(result.markdown).toContain('```\necho "no language specified"\n```');
  });

  it("converts panels as blockquotes and expand as details", async () => {
    const content = await fetchPageContent(pageInfo("1004"));
    const result = convertHtmlToMarkdown(content.html, content.title);

    expect(result.markdown).toContain("> **Info:**");
    expect(result.markdown).toContain("smoke tests");
    expect(result.markdown).toContain("> **Warning:**");
    expect(result.markdown).toContain("Never deploy on Fridays");
    expect(result.markdown).toContain("<details>");
    expect(result.markdown).toContain(
      "<summary>Emergency rollback steps</summary>",
    );
    expect(result.markdown).toContain("Revert the last deployment commit");
  });

  it("converts status macros and user mentions, removes TOC", async () => {
    const content = await fetchPageContent(pageInfo("1005"));
    const result = convertHtmlToMarkdown(content.html, content.title);

    // Status macro
    expect(result.markdown).toContain("**[ON TRACK]**");
    // User mentions as plain text, not links
    expect(result.markdown).toContain("Jane Smith");
    expect(result.markdown).toContain("Bob Doe");
    expect(result.markdown).not.toContain("[Jane Smith]");
    expect(result.markdown).not.toContain("confluence-userlink");
    // TOC removed
    expect(result.markdown).not.toContain("Table of contents");
  });
});

// --- AC #6: Filename sanitization ---

describe("filename sanitization", () => {
  it("removes special characters from title", () => {
    const title = "Page with Special/Characters: in <title> & more*";
    const sanitized = sanitizeTitle(title);
    expect(sanitized).not.toMatch(/[/:?*<>|\\]/);
    expect(sanitized).toContain("Page with Special");
    expect(sanitized).toContain("& more");
  });

  it("builds filename with spaceKey and sanitized title", () => {
    const filename = buildFilename(
      "TEST",
      "1006",
      "Page with Special/Characters: in <title> & more*",
    );
    expect(filename).toBe("TEST - Page with SpecialCharacters in title & more.md");
  });

  it("builds filename with pageId fallback when spaceKey is empty", () => {
    const filename = buildFilename(
      "",
      "1006",
      "Page with Special/Characters: in <title> & more*",
    );
    expect(filename).toBe("1006 - Page with SpecialCharacters in title & more.md");
  });

  it("collapses multiple spaces", () => {
    expect(sanitizeTitle("Hello   World")).toBe("Hello World");
  });

  it("trims leading and trailing whitespace", () => {
    expect(sanitizeTitle("  Spaced  ")).toBe("Spaced");
  });

  it("end-to-end: special title page through full pipeline", async () => {
    const content = await fetchPageContent(pageInfo("1006"));
    const result = convertHtmlToMarkdown(content.html, content.title);

    // Converter sanitized filename
    expect(result.filename).toBe(
      "Page with SpecialCharacters in title & more.md",
    );
    // Downloader filename with spaceKey prefix
    const dlFilename = buildFilename("TEST", "1006", content.title);
    expect(dlFilename).toMatch(/^TEST - /);
    expect(dlFilename).toMatch(/\.md$/);
    expect(dlFilename).not.toMatch(/[/:?*<>|\\]/);
  });
});

// --- AC #2: Multiple test page types are exercised ---
// (covered across the above tests: plain text+headings in 1001, tables in 1002,
//  code blocks with language in 1003, info/warning panels + expand in 1004,
//  status + mentions in 1005, special characters in title in 1006)
