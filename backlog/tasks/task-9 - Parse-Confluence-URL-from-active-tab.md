---
id: TASK-9
title: Parse Confluence URL from active tab
status: Done
assignee:
  - '@claude'
created_date: '2026-04-01 19:19'
updated_date: '2026-04-01 20:21'
labels: []
dependencies:
  - TASK-8
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement url-parser.ts that extracts host and pageId from a Confluence URL. Support both Server/DC and Cloud URL formats. Export a function usable from popup and background.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Extracts host and pageId from URL
- [x] #2 Supports /pages/viewpage.action?pageId=123 (Server/DC)
- [x] #3 Supports /wiki/spaces/SPACE/pages/123/Title (Cloud)
- [x] #4 Returns null for non-Confluence URLs
- [x] #5 Unit tests pass
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Implement parseConfluenceUrl in url-parser.ts. Parse URL with URL constructor. Match Server/DC format (/pages/viewpage.action?pageId=NNN) and Cloud format (/wiki/spaces/SPACE/pages/NNN/Title). Return ConfluencePageInfo with baseUrl, spaceKey, pageId, pageTitle. Return null for non-Confluence URLs. Write unit tests in tests/url-parser.test.ts.

Commit: `dfcbc80` - task-9: Parse Confluence URL from active tab

Commit: `47f7b79` - task-9: Add display format test coverage

Implemented parseConfluenceUrl supporting Server/DC viewpage.action, Cloud /wiki/spaces, and Server/DC /display formats. 12 unit tests covering all formats plus edge cases. Files: src/url-parser.ts, tests/url-parser.test.ts.
<!-- SECTION:NOTES:END -->
