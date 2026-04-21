---
id: TASK-33
title: Fix table conversion for Confluence tables without thead
status: Done
assignee:
  - '@claude'
created_date: '2026-04-21 12:13'
updated_date: '2026-04-21 12:39'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Turndown GFM plugin only converts tables to markdown pipes if the first row is a heading row (in thead or using th cells). Confluence export_view HTML often produces tables with only tbody and td cells for all rows, causing them to remain as raw HTML table elements. Fix: pre-process HTML before Turndown conversion to normalize table structure — promote first row td cells to th and wrap in thead when thead is missing.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Tables without thead but with td header cells convert to markdown pipe tables
- [x] #2 Tables with proper thead still work (no regression)
- [x] #3 Tables with th cells in tbody first row still work
- [x] #4 Test with real Confluence table HTML fixture
- [x] #5 Build and lint pass
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Add a normalizeTableHeaders() function that pre-processes HTML string before Turndown conversion. It will use regex or DOMParser-like approach to find tables without thead and promote the first row's td cells to th, wrapping in thead. Called in convertHtmlToMarkdown before service.turndown(html). Add tests for: no-thead tables, existing thead tables (regression), th-in-tbody tables, real Confluence HTML fixture.

Commit: `9a10773` - task-33: Normalize table headers before Turndown conversion

Implemented normalizeTableHeaders() that pre-processes HTML tables without thead before Turndown conversion. Promotes first row td to th, wraps in thead. Files changed: converter.ts, converter.test.ts. 4 new tests added.
<!-- SECTION:NOTES:END -->
