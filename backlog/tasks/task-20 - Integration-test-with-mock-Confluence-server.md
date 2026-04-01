---
id: TASK-20
title: Integration test with mock Confluence server
status: Done
assignee:
  - '@claude'
created_date: '2026-04-01 20:29'
updated_date: '2026-04-01 21:12'
labels: []
dependencies:
  - TASK-19
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
End-to-end integration test for the extension pipeline without a browser. Express mock server pretends to be Confluence REST API. Test imports extension modules directly and verifies the full flow: parse URL → fetch from mock → convert HTML to markdown → verify output.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Express mock server serves /rest/api/content/:pageId?expand=body.export_view with realistic JSON
- [x] #2 Test pages: plain text + headings, tables, code blocks with language, info/warning panels, expand macro, status, mentions, special characters in title
- [x] #3 Test: parseConfluenceUrl extracts host and pageId from Server/DC and Cloud URL formats
- [x] #4 Test: fetch from mock server returns valid title and body.export_view.value
- [x] #5 Test: converter produces correct markdown (tables, code fences, panels as blockquotes)
- [x] #6 Test: filename sanitization removes special characters from title
- [x] #7 Test: non-Confluence URL returns null from parser
- [x] #8 Runs via npm run test (vitest), no browser or Playwright needed
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Create integration test that exercises full pipeline without browser. Use Express mock server to serve Confluence REST API responses. Test flow: parseConfluenceUrl → fetchPageContent (against mock server) → convertHtmlToMarkdown → verify output. Mock server serves /rest/api/content/:pageId?expand=body.export_view with realistic HTML content. Test pages: plain text+headings, tables, code blocks with language, info/warning panels, expand macro, status, mentions, special chars in title. Also test URL parser for Server/DC and Cloud formats, and filename sanitization. All via vitest, no browser needed.

Commit: `188696e` - task-20: Integration test with mock Confluence server

Implemented Express mock Confluence server with 6 test pages covering all content types. 20 integration tests verify full pipeline: URL parsing, API fetch, HTML-to-markdown conversion, and filename sanitization. Added express and @types/express as dev dependencies. Files: tests/integration.test.ts (new), package.json, package-lock.json.
<!-- SECTION:NOTES:END -->
